import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { AppraisalBy } from '../appraisal-by/appraisal-by.entity';

@Injectable()
export class EvaluationReportService {
    constructor(
        @InjectRepository(AppraisalUser)
        private readonly appraisalUserRepo: Repository<AppraisalUser>,
        @InjectRepository(AppraisalBy)
        private readonly appraisalByRepo: Repository<AppraisalBy>,
    ) { }

    async getReport(appraisalUserId: string) {
        // 1. Get the AppraisalUser with owner + appraisal info
        const appraisalUser = await this.appraisalUserRepo.findOne({
            where: { appraisalUserId },
            relations: ['owner', 'appraisal'],
        });

        if (!appraisalUser) {
            return null;
        }

        // 2. Competency assessments for this appraisalUser (all evaluators)
        const competencyAssessments = await this.appraisalUserRepo
            .createQueryBuilder('au')
            .leftJoinAndSelect('au.competencyAssessments', 'ca')
            .leftJoinAndSelect('ca.competencyQuestion', 'cq')
            .leftJoinAndSelect('cq.department', 'dept')
            .leftJoinAndSelect('ca.evaluator', 'evaluator')
            .where('au.appraisalUserId = :appraisalUserId', { appraisalUserId })
            .getOne();

        // 3. Goals with assessments
        const goalsData = await this.appraisalUserRepo
            .createQueryBuilder('au')
            .leftJoinAndSelect('au.goals', 'goal')
            .leftJoinAndSelect('goal.goalAssessmentBy', 'gab')
            .leftJoinAndSelect('gab.gradedByUser', 'grader')
            .where('au.appraisalUserId = :appraisalUserId', { appraisalUserId })
            .getOne();

        // 4. Final assessments (AppraisalBy)
        const finalAssessments = await this.appraisalByRepo.find({
            where: { appraisalId: appraisalUserId },
            relations: ['assessedBy'],
            order: { created: 'DESC' },
        });

        // Structure the response
        const ownerId = appraisalUser.owner?.userId;

        // Group competency assessments by question
        const competencyByQuestion: Record<string, {
            competencyId: string;
            question: string;
            department: string;
            selfGrade?: string;
            selfComment?: string;
            leaderGrade?: string;
            leaderComment?: string;
            leaderName?: string;
        }> = {};

        if (competencyAssessments?.competencyAssessments) {
            for (const ca of competencyAssessments.competencyAssessments) {
                const qId = ca.competencyQuestion?.competencyId;
                if (!qId) continue;

                if (!competencyByQuestion[qId]) {
                    competencyByQuestion[qId] = {
                        competencyId: qId,
                        question: ca.competencyQuestion?.question || '',
                        department: ca.competencyQuestion?.department?.departmentName || '기타',
                    };
                }

                if (ca.evaluatorId === ownerId) {
                    competencyByQuestion[qId].selfGrade = ca.grade;
                    competencyByQuestion[qId].selfComment = ca.comment;
                } else {
                    competencyByQuestion[qId].leaderGrade = ca.grade;
                    competencyByQuestion[qId].leaderComment = ca.comment;
                    competencyByQuestion[qId].leaderName = ca.evaluator?.koreanName;
                }
            }
        }

        // Group goals with assessments
        const goals = (goalsData?.goals || []).map(g => {
            const selfAssessment = g.goalAssessmentBy?.find(gab => gab.gradedBy === ownerId);
            const leaderAssessment = g.goalAssessmentBy?.find(gab => gab.gradedBy !== ownerId);

            return {
                goalId: g.goalId,
                title: g.title,
                description: g.description,
                goalType: g.goalType,
                selfGrade: selfAssessment?.grade,
                selfComment: selfAssessment?.comment,
                leaderGrade: leaderAssessment?.grade,
                leaderComment: leaderAssessment?.comment,
                leaderName: leaderAssessment?.gradedByUser?.koreanName,
            };
        });

        return {
            appraisalUserId,
            owner: {
                userId: appraisalUser.owner?.userId,
                koreanName: appraisalUser.owner?.koreanName,
            },
            appraisalTitle: appraisalUser.appraisal?.title,
            appraisalStatus: appraisalUser.appraisal?.status,
            userStatus: appraisalUser.status,
            competency: Object.values(competencyByQuestion),
            goals,
            finalAssessments: finalAssessments.map(fa => ({
                appraisalById: fa.appraisalById,
                assessType: fa.assessType,
                assessTerm: fa.assessTerm,
                grade: fa.grade,
                comment: fa.comment,
                assessedBy: fa.assessedBy?.koreanName,
                created: fa.created,
            })),
        };
    }
}
