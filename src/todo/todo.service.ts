import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { ReviewAssignment } from '../leader-review-assignment/review-assignment.entity';
import { DepartmentService } from '../department/department.service';
import { HramsUserDepartmentService } from '../hrams-user-department/hrams-user-department.service';
import { Goal } from '../goal/goal.entity';

@Injectable()
export class TodoService {
    constructor(
        @InjectRepository(AppraisalUser)
        private readonly appraisalUserRepo: Repository<AppraisalUser>,
        @InjectRepository(ReviewAssignment)
        private readonly reviewAssignmentRepo: Repository<ReviewAssignment>,
        private readonly departmentService: DepartmentService,
        private readonly hramsUserDepartmentService: HramsUserDepartmentService,
        @InjectRepository(Goal)
        private readonly goalRepo: Repository<Goal>,
    ) { }

    async getMyTodos(userId: string) {
        // 1. My Competency & Goal Self-Assessments (AppraisalUser where owner is me, and appraisal is ongoing)
        const myAppraisalsUsers = await this.appraisalUserRepo
            .createQueryBuilder('au')
            .innerJoinAndSelect('au.appraisal', 'appraisal')
            .innerJoin('au.owner', 'owner')
            .leftJoin('appraisal.competencyQuestions', 'cq')
            .leftJoin('au.competencyAssessments', 'ca_self', 'ca_self.evaluatorId = :userId AND ca_self.competencyId = cq."competencyId"', { userId })
            .leftJoin('au.goals', 'goals')
            .leftJoin('goals.goalAssessmentBy', 'ga_self', 'ga_self.gradedBy = :userId AND ga_self.goalId = goals."goalId"', { userId })
            .where('owner.userId = :userId', { userId })
            .andWhere('appraisal.status = :ongoing', { ongoing: 'ongoing' })
            .addSelect('COUNT(DISTINCT cq."competencyId")', 'cqTotal')
            .addSelect('COUNT(DISTINCT CASE WHEN ca_self.grade IS NOT NULL AND ca_self.grade != \'\' THEN ca_self.assessmentId END)', 'competencyCompleted')
            .addSelect('COUNT(DISTINCT goals."goalId")', 'goalTotal')
            .addSelect('COUNT(DISTINCT CASE WHEN ga_self.grade IS NOT NULL AND ga_self.grade != \'\' THEN ga_self.goalAssessId END)', 'goalCompleted')
            .addGroupBy('au.appraisalUserId')
            .addGroupBy('appraisal.appraisalId')
            .getRawAndEntities();

        const selfCompetencyTodos = [];
        const selfGoalTodos = [];

        for (let i = 0; i < myAppraisalsUsers.entities.length; i++) {
            const entity = myAppraisalsUsers.entities[i];
            const raw = myAppraisalsUsers.raw.find(r => r.au_appraisalUserId === entity.appraisalUserId);

            const cqTotal = parseInt(raw?.cqTotal || '0', 10);
            const compCompleted = parseInt(raw?.competencyCompleted || '0', 10);
            const goalTotal = parseInt(raw?.goalTotal || '0', 10);
            const goalCompleted = parseInt(raw?.goalCompleted || '0', 10);

            console.log("DEBUG TODO - Appraisal:", entity.appraisal.title);
            console.log("DEBUG TODO - Status:", entity.status, "| Raw:", JSON.stringify(raw));
            console.log("DEBUG TODO - Counts:", { cqTotal, compCompleted, goalTotal, goalCompleted });

            // Competency is pending only if there are questions and not all are graded
            const isCompetencyPending = cqTotal > 0 && compCompleted < cqTotal;
            // For goals, pending if there are ungraded goals, or if no goals registered and not yet submitted
            const isGoalPending = (goalTotal > 0 && goalCompleted < goalTotal) || (goalTotal === 0 && entity.status !== 'submitted');

            if (isCompetencyPending) {
                selfCompetencyTodos.push({
                    id: `${entity.appraisalUserId}_comp`,
                    title: entity.appraisal.title,
                    type: 'COMPETENCY_SELF',
                    appraisalId: entity.appraisal.appraisalId,
                    appraisalUserId: entity.appraisalUserId,
                });
            }

            if (isGoalPending) {
                selfGoalTodos.push({
                    id: `${entity.appraisalUserId}_goal`,
                    title: entity.appraisal.title,
                    type: 'GOAL_SELF',
                    appraisalId: entity.appraisal.appraisalId,
                });
            }
        }

        // 2. My Leader Reviews (where I am a reviewer, and the review is IN_PROGRESS)
        const pendingLeaderReviews = await this.reviewAssignmentRepo
            .createQueryBuilder('ra')
            .innerJoinAndSelect('ra.leaderReview', 'lr')
            .innerJoinAndSelect('lr.cycle', 'cycle')
            .innerJoinAndSelect('lr.target', 'target')
            .where('ra.reviewerId = :userId', { userId })
            .andWhere('ra.status != :submittedStatus', { submittedStatus: 'SUBMITTED' })
            .andWhere('lr.status = :inProgress', { inProgress: 'IN_PROGRESS' })
            .getMany();

        const leaderReviewTodos = pendingLeaderReviews.map(ra => ({
            id: ra.assignmentId,
            title: `${ra.leaderReview?.cycle?.title || '리더 평가'} - ${ra.leaderReview?.target?.koreanName}님 평가`,
            type: 'LEADER_REVIEW' as const,
            assignmentId: ra.assignmentId,
        }));

        // 3. Team Member Appraisals (leader only) (where I am a leader of their department, and their AppraisalUser status != 'finished' for goals/competency by ME)
        // To simplify for MVP, we just count them.
        const myLeaderDeps = await this.hramsUserDepartmentService.getHramsUserDepartmentsByUserId(userId);
        const leaderDeptIds = myLeaderDeps.filter(d => d.isLeader).map(d => d.department.departmentId);

        let teamCompetencyTodos = [];
        let teamGoalTodos = [];

        if (leaderDeptIds.length > 0) {
            // Find all team members
            const allTeamDeptIds = new Set<string>();
            for (const deptId of leaderDeptIds) {
                allTeamDeptIds.add(deptId); // Include the leader's own department
                const descendants = await this.departmentService.getDescendants(deptId);
                descendants.forEach(d => allTeamDeptIds.add(d.departmentId));
            }

            console.log("DEBUG LEADER - leaderDeptIds:", leaderDeptIds);
            console.log("DEBUG LEADER - allTeamDeptIds:", Array.from(allTeamDeptIds));
            console.log("DEBUG LEADER - userId:", userId);

            if (allTeamDeptIds.size > 0) {
                // To find if I (the leader) have pending tasks, we must check:
                // 1. Competency: Does the leader lack CA entries for any of the questions?
                // 2. Goal: Are there registered Goals for this appraisalUser where the leader lacks GA entries?
                const teamAppraisalUsers = await this.appraisalUserRepo
                    .createQueryBuilder('au')
                    .innerJoinAndSelect('au.appraisal', 'appraisal')
                    .innerJoin('au.owner', 'owner')
                    .innerJoin('owner.hramsUserDepartments', 'hud')
                    .leftJoin('appraisal.competencyQuestions', 'cq')
                    .leftJoin('au.competencyAssessments', 'ca_leader', 'ca_leader.evaluatorId = :userId AND ca_leader.competencyId = cq."competencyId"', { userId })
                    .leftJoin('au.goals', 'goals')
                    .leftJoin('goals.goalAssessmentBy', 'ga_leader', 'ga_leader.gradedBy = :userId AND ga_leader.goalId = goals."goalId"', { userId })
                    .where('appraisal.status = :ongoing', { ongoing: 'ongoing' })
                    .andWhere('hud.departmentId IN (:...deptIds)', { deptIds: Array.from(allTeamDeptIds) })
                    .andWhere('owner.userId != :userId', { userId })
                    // We remove au.status = 'submitted' check to ensure leaders can evaluate regardless of team submission status
                    .addSelect('COUNT(DISTINCT cq."competencyId")', 'cqTotal')
                    .addSelect('COUNT(DISTINCT CASE WHEN ca_leader.grade IS NOT NULL AND ca_leader.grade != \'\' THEN ca_leader.assessmentId END)', 'competencyCompleted')
                    .addSelect('COUNT(DISTINCT goals."goalId")', 'goalTotal')
                    .addSelect('COUNT(DISTINCT CASE WHEN ga_leader.grade IS NOT NULL AND ga_leader.grade != \'\' THEN ga_leader.goalAssessId END)', 'goalCompleted')
                    .addGroupBy('au.appraisalUserId')
                    .addGroupBy('appraisal.appraisalId')
                    .getRawAndEntities();

                console.log("DEBUG LEADER - teamAppraisalUsers count:", teamAppraisalUsers.entities.length);
                console.log("DEBUG LEADER - raw rows:", teamAppraisalUsers.raw.length);

                // Group them by appraisal if there's remaining work
                const teamAppraisalMap = new Map();

                for (let i = 0; i < teamAppraisalUsers.entities.length; i++) {
                    const entity = teamAppraisalUsers.entities[i];
                    const raw = teamAppraisalUsers.raw.find(r => r.au_appraisalUserId === entity.appraisalUserId);

                    console.log("DEBUG LEADER TEAM MEMBER:", entity.appraisalUserId, "raw:", JSON.stringify(raw));

                    const cqTotal = parseInt(raw?.cqTotal || '0', 10);
                    const compCompleted = parseInt(raw?.competencyCompleted || '0', 10);
                    const goalTotal = parseInt(raw?.goalTotal || '0', 10);
                    const goalCompleted = parseInt(raw?.goalCompleted || '0', 10);

                    let needsCompetencyAction = false;
                    let needsGoalAction = false;

                    if (cqTotal > 0 && compCompleted < cqTotal) {
                        needsCompetencyAction = true;
                    }
                    if (goalTotal > 0 && goalCompleted < goalTotal) {
                        needsGoalAction = true;
                    }

                    if (needsCompetencyAction || needsGoalAction) {
                        if (!teamAppraisalMap.has(entity.appraisal.appraisalId)) {
                            teamAppraisalMap.set(entity.appraisal.appraisalId, {
                                appraisal: entity.appraisal,
                                competencyCount: 0,
                                goalCount: 0,
                            });
                        }
                        if (needsCompetencyAction) teamAppraisalMap.get(entity.appraisal.appraisalId).competencyCount++;
                        if (needsGoalAction) teamAppraisalMap.get(entity.appraisal.appraisalId).goalCount++;
                    }
                }

                for (const [key, value] of teamAppraisalMap.entries()) {
                    if (value.competencyCount > 0) {
                        teamCompetencyTodos.push({
                            id: `${value.appraisal.appraisalId}_tc`,
                            title: `[팀원 평가] ${value.appraisal.title} (${value.competencyCount}명)`,
                            type: 'TEAM_COMPETENCY',
                            appraisalId: value.appraisal.appraisalId,
                        });
                    }
                    if (value.goalCount > 0) {
                        teamGoalTodos.push({
                            id: `${value.appraisal.appraisalId}_tg`,
                            title: `[팀원 평가] ${value.appraisal.title} (${value.goalCount}명)`,
                            type: 'TEAM_GOAL',
                            appraisalId: value.appraisal.appraisalId,
                        });
                    }
                }
            }
        }

        const isLeader = leaderDeptIds.length > 0;

        return {
            selfCompetency: selfCompetencyTodos,
            selfGoal: selfGoalTodos,
            ...(leaderReviewTodos.length > 0 ? { leaderReview: leaderReviewTodos } : {}),
            ...(isLeader ? {
                teamCompetency: teamCompetencyTodos,
                teamGoal: teamGoalTodos,
            } : {}),
        };
    }
}
