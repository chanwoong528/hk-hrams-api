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
        const myLeaderDeps = await this.hramsUserDepartmentService.getHramsUserDepartmentsByUserId(userId);
        const leaderDeptIds = myLeaderDeps.filter(d => d.isLeader).map(d => d.department.departmentId);
        const myRank = myLeaderDeps.reduce((min, d) => Math.min(min, d.department?.rank ?? 99), 99);

        // Check if user is HR/Admin (Special case)
        const isAdmin = myLeaderDeps.some(ud => ud.department?.departmentName.toLowerCase() === 'hr' || ud.department?.departmentName === '인사팀') || userId === 'some-admin-id-if-needed';

        // 1. My Competency & Goal Self-Assessments (AppraisalUser where owner is me, and appraisal is ongoing)
        const myAppraisalsUsersQuery = this.appraisalUserRepo
            .createQueryBuilder('au')
            .innerJoinAndSelect('au.appraisal', 'appraisal')
            .innerJoin('au.owner', 'owner')
            .leftJoin('appraisal.competencyQuestions', 'cq')
            .leftJoin('au.competencyAssessments', 'ca_self', 'ca_self.evaluatorId = :userId AND ca_self.competencyId = cq."competencyId"', { userId })
            .leftJoin('au.goals', 'goals')
            .leftJoin('goals.goalAssessmentBy', 'ga_self', 'ga_self.gradedBy = :userId AND ga_self.goalId = goals."goalId"', { userId })
            .where('owner.userId = :userId', { userId })
            .andWhere('appraisal.status = :ongoing', { ongoing: 'ongoing' });

        const myAppraisalsUsersResult = await myAppraisalsUsersQuery
            .addSelect('COUNT(DISTINCT cq."competencyId")', 'cqTotal')
            .addSelect('COUNT(DISTINCT CASE WHEN ca_self.grade IS NOT NULL AND ca_self.grade != \'\' THEN ca_self.assessmentId END)', 'competencyCompleted')
            .addSelect('COUNT(DISTINCT goals."goalId")', 'goalTotal')
            .addSelect('COUNT(DISTINCT CASE WHEN ga_self.grade IS NOT NULL AND ga_self.grade != \'\' THEN ga_self.goalAssessId END)', 'goalCompleted')
            .addGroupBy('au.appraisalUserId')
            .addGroupBy('appraisal.appraisalId')
            .getRawAndEntities();

        const selfCompetencyTodos = [];
        const selfGoalTodos = [];

        for (let i = 0; i < myAppraisalsUsersResult.entities.length; i++) {
            const entity = myAppraisalsUsersResult.entities[i];
            const raw = myAppraisalsUsersResult.raw.find(r => r.au_appraisalUserId === entity.appraisalUserId);

            const cqTotal = parseInt(raw?.cqTotal || '0', 10);
            const compCompleted = parseInt(raw?.competencyCompleted || '0', 10);
            const goalTotal = parseInt(raw?.goalTotal || '0', 10);
            const goalCompleted = parseInt(raw?.goalCompleted || '0', 10);

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

        // 3. Team Member Appraisals (leader only)
        let teamCompetencyTodos = [];
        let teamGoalTodos = [];

        if (leaderDeptIds.length > 0) {
            const allTeamDeptIds = new Set<string>();
            for (const deptId of leaderDeptIds) {
                allTeamDeptIds.add(deptId);
                const descendants = await this.departmentService.getDescendants(deptId);
                descendants.forEach(d => allTeamDeptIds.add(d.departmentId));
            }

            if (allTeamDeptIds.size > 0) {
                const teamAppraisalUsersQuery = this.appraisalUserRepo
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
                    .andWhere('owner.userId != :userId', { userId });

                // Corrected Rank Filtering Logic:
                // If 0 is CEO (Top). Smaller number = more senior.
                // User says: Max Rank 2 should block Rank 1 and 2.
                // This means: Allowed if rank > 2.
                // And for Min Rank (Bottom limit): Allowed if rank <= minGradeRank.
                if (!isAdmin) {
                    teamAppraisalUsersQuery.andWhere(
                        '(appraisal.minGradeRank IS NULL OR :myRank <= appraisal.minGradeRank)',
                        { myRank },
                    );
                    teamAppraisalUsersQuery.andWhere(
                        '(appraisal.maxGradeRank IS NULL OR :myRank >= appraisal.maxGradeRank)',
                        { myRank },
                    );
                }

                const teamAppraisalUsersResult = await teamAppraisalUsersQuery
                    .addSelect('COUNT(DISTINCT cq."competencyId")', 'cqTotal')
                    .addSelect('COUNT(DISTINCT CASE WHEN ca_leader.grade IS NOT NULL AND ca_leader.grade != \'\' THEN ca_leader.assessmentId END)', 'competencyCompleted')
                    .addSelect('COUNT(DISTINCT goals."goalId")', 'goalTotal')
                    .addSelect('COUNT(DISTINCT CASE WHEN ga_leader.grade IS NOT NULL AND ga_leader.grade != \'\' THEN ga_leader.goalAssessId END)', 'goalCompleted')
                    .addGroupBy('au.appraisalUserId')
                    .addGroupBy('appraisal.appraisalId')
                    .getRawAndEntities();

                const teamAppraisalMap = new Map();

                for (let i = 0; i < teamAppraisalUsersResult.entities.length; i++) {
                    const entity = teamAppraisalUsersResult.entities[i];
                    const raw = teamAppraisalUsersResult.raw.find(r => r.au_appraisalUserId === entity.appraisalUserId);

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
