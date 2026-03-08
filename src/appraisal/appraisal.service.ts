import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateAppraisalPayload,
  UpdateAppraisalPayload,
} from './appraisal.dto';
import { Appraisal } from './appraisal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Like, QueryFailedError, Repository } from 'typeorm';

import { CustomException } from 'src/common/exceptions/custom-exception';
import { formatAppraisalNested } from './appraisal.adaptor';
import { DepartmentService } from 'src/department/department.service';
import { HramsUserService } from 'src/hrams-user/hrams-user.service';

@Injectable()
export class AppraisalService {
  private readonly customException = new CustomException('Appraisal');

  constructor(
    @InjectRepository(Appraisal)
    private readonly appraisalRepository: Repository<Appraisal>,
    private readonly departmentService: DepartmentService,
    private readonly hramsUserService: HramsUserService,
  ) { }

  async getAppraisalTeamMembers(
    departmentIds: string[],
    userId: string,
  ): Promise<FormattedAppraisalResponse> {

    // 1. Get all descendants for each leader-department
    const allDepartmentIds = new Set<string>(departmentIds);

    for (const deptId of departmentIds) {
      const descendants = await this.departmentService.getDescendants(deptId);
      descendants.forEach(d => allDepartmentIds.add(d.departmentId));
    }

    // 2. Fetch members for ALL collected departments at once
    const uniqueDepartmentIds = Array.from(allDepartmentIds);

    if (uniqueDepartmentIds.length === 0) return [];

    return this.getAppraisalTeamMembersByAppraisalIds(uniqueDepartmentIds, userId);
  }

  async getAppraisalTeamMembersByAppraisalIds(
    departmentIds: string[],
    userId: string,
  ): Promise<FormattedAppraisalResponse> {
    const appraisal = await this.appraisalRepository
      .createQueryBuilder('appraisal')
      .leftJoin('appraisal.appraisalUsers', 'appraisalUser')
      .leftJoin('appraisalUser.owner', 'owner')
      .leftJoin('owner.hramsUserDepartments', 'hud')
      .leftJoin('hud.department', 'department')
      .where('appraisal.status = :status', { status: 'ongoing' })
      .andWhere('department.departmentId IN (:...departmentIds)', {
        departmentIds: departmentIds
      })
      .andWhere('owner.userId != :userId', { userId })
      .leftJoin('appraisalUser.competencyAssessments', 'ca_leader', 'ca_leader.evaluatorId = :userId', { userId })
      .leftJoinAndSelect('appraisalUser.goals', 'goals')
      .leftJoinAndSelect('goals.goalAssessmentBy', 'goalAssessmentBy')
      .leftJoinAndSelect('goalAssessmentBy.gradedByUser', 'gradedByUser')
      .leftJoinAndSelect('appraisalUser.appraisalBy', 'appraisalBy') // Added Join
      .select([
        'appraisal.appraisalId',
        'appraisal.appraisalType',
        'appraisal.title',
        'appraisal.description',
        'appraisal.endDate',
        'appraisal.status',
        'appraisal.created',
        'appraisal.updated',
        'department.departmentName',
        'department.departmentId',
        'appraisalUser.appraisalUserId',
        'appraisalUser.status',
        'owner.userId',
        'owner.koreanName',
        'COUNT(ca_leader.assessmentId) OVER(PARTITION BY appraisalUser.appraisalUserId) AS leaderCompetencyTotal',
        'COUNT(CASE WHEN ca_leader.grade IS NOT NULL THEN 1 END) OVER(PARTITION BY appraisalUser.appraisalUserId) AS leaderCompetencyCompleted',
        'goals.goalId',
        'goals.title',
        'goals.description',
        'goals.created',
        'goals.updated',
        'goalAssessmentBy.goalAssessId',
        'goalAssessmentBy.grade',
        'goalAssessmentBy.gradedBy',
        'goalAssessmentBy.comment',
        'gradedByUser.userId',
        'gradedByUser.koreanName',
        // Select AppraisalBy fields
        'appraisalBy.appraisalById',
        'appraisalBy.grade',
        'appraisalBy.comment',
        'appraisalBy.assessType',
        'appraisalBy.assessTerm',
        'appraisalBy.assessedById',
        'appraisalBy.updated', // Added updated column
      ])
      .getRawMany();

    return formatAppraisalNested(appraisal);
  }

  async getAllAppraisals(): Promise<Appraisal[]> {
    try {
      const qb = this.appraisalRepository
        .createQueryBuilder('a')
        // 전체 카운트
        .loadRelationCountAndMap('a.totalCount', 'a.appraisalUsers')
        // 조건부 카운트 (status = 'submitted')
        .loadRelationCountAndMap(
          'a.submittedCount',
          'a.appraisalUsers',
          'au',
          (subQb) =>
            subQb.where('au.status = :submitted', { submitted: 'submitted' }),
        );

      // 필요하면 정렬/페이징/검색 추가 가능
      // qb.orderBy('a.createdAt', 'DESC');
      // qb.skip((page - 1) * size).take(size);

      const list = await qb.getMany();
      return list;
    } catch (error) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getAllAppraisalById(
    appraisalId: string,
    page: number = 1,
    limit: number = 10,
    keyword?: string,
  ): Promise<{ list: any[]; total: number }> { // Changed return type to any[] or extending Appraisal to include creator
    try {
      const appraisal = await this.appraisalRepository.findOne({
        where: { appraisalId },
      });
      if (!appraisal) {
        throw new NotFoundException('Appraisal not found');
      }
      const [appraisals, total] = await this.appraisalRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          appraisalId: appraisalId,
          ...(keyword?.trim() && {
            assessTarget: { koreanName: Like(`%${keyword}%`) },
          }),
        },
        relations: ['appraisalUsers', 'appraisalUsers.owner'],
      });

      // Manually join Creator
      let creator = null;
      if (appraisal.createdBy) {
        creator = await this.hramsUserService.getHramsUserById(appraisal.createdBy);
      }

      const list = appraisals.map((appraisal) => ({
        ...appraisal,
        creator: creator, // Attach creator info
      }));

      return {
        list: list.map((appraisal) => ({
          ...appraisal,
          submittedCount: appraisal.appraisalUsers.filter(
            (appraisalUser) => appraisalUser.status === 'submitted',
          ).length,
        })),
        total: total,
      };
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getAppraisalsByTitle(title: string): Promise<Appraisal[]> {
    return await this.appraisalRepository.find({
      where: { title: Like(`%${title}%`) },
    });
  }

  async getMyAppraisal(userId: string): Promise<Appraisal[]> {
    try {
      if (!userId) {
        throw new UnauthorizedException('User not found');
      }
      const appraisals = await this.appraisalRepository.find({
        where: { appraisalUsers: { owner: { userId } } },
        relations: [
          'appraisalUsers',
          'appraisalUsers.owner',
          'appraisalUsers.appraisalBy', // Added relation
          'appraisalUsers.appraisalBy.assessedBy', // Added relation to be safe
          'appraisalUsers.goals',
          'appraisalUsers.goals.goalAssessmentBy',
          'appraisalUsers.goals.goalAssessmentBy.gradedByUser',
        ],
      });

      return appraisals.map((appraisal) => {
        const myAppraisalUser = appraisal.appraisalUsers.find(
          (au) => au.owner.userId === userId,
        );

        // Debug Log
        if (myAppraisalUser) {
          console.log(`[getMyAppraisal] Found User: ${userId}`);
          console.log(`[getMyAppraisal] AppraisalBy Count: ${myAppraisalUser.appraisalBy?.length}`);
          myAppraisalUser.appraisalBy?.forEach((ab, idx) => {
            console.log(`[getMyAppraisal] Entry ${idx}: ID=${ab.appraisalById}, AssessedById=${ab.assessedById}, assessedByRel=${ab.assessedBy?.userId}, Grade=${ab.grade}`);
          });
        }

        // Find self assessment (Check both ID column and Relation object)
        const selfAssessmentData = myAppraisalUser?.appraisalBy?.find(
          ab => ab.assessedById === userId || ab.assessedBy?.userId === userId
        );

        return {
          ...appraisal,
          appraisalUserId: myAppraisalUser?.appraisalUserId,
          status: myAppraisalUser?.status,
          selfAssessment: selfAssessmentData ? {
            grade: selfAssessmentData.grade,
            comment: selfAssessmentData.comment,
            updated: selfAssessmentData.updated ? selfAssessmentData.updated.toISOString() : undefined
          } : undefined,
          goals: appraisal.appraisalUsers.flatMap(
            (appraisalUser) => appraisalUser.goals,
          ),
        };
      });
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getAallCountByDistinctAppraisalType(keyword?: string): Promise<
    {
      appraisalType: string;
      count: number;
    }[]
  > {
    try {
      const qb = this.appraisalRepository
        .createQueryBuilder('pa')
        .select('pa.appraisalType', 'appraisalType')
        .addSelect('pa.endDate', 'endDate')
        .addSelect('pa.title', 'title') // 보여줄 필요 없으면 이것도 제거 가능
        .addSelect('COUNT(*)', 'count')
        .groupBy('pa.appraisalType')
        .addGroupBy('pa.endDate')
        .addGroupBy('pa.title'); // title을 select하면 groupBy에도 필요

      if (keyword?.trim()) {
        const tokens = keyword.trim().split(/\s+/);
        qb.andWhere(
          new Brackets((outer) => {
            tokens.forEach((tk, i) => {
              outer.andWhere(
                new Brackets((inner) => {
                  inner
                    .where(`pa.appraisalType ILIKE :k${i}`)
                    .orWhere(`pa.title ILIKE :k${i}`);
                }),
              );
              qb.setParameter(`k${i}`, `%${tk}%`);
            });
          }),
        );
      }

      return await qb.getRawMany();
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async createAppraisal(
    createAppraisalPayload: CreateAppraisalPayload,
    userId: string,
  ): Promise<Appraisal> {
    //maybe have to make as message queue to handle many input to be inserted
    try {
      const appraisal = this.appraisalRepository.create({
        title: createAppraisalPayload.title,
        appraisalType: createAppraisalPayload.appraisalType,
        description: createAppraisalPayload.description,
        endDate: createAppraisalPayload.endDate,
        createdBy: userId,
      });

      const result = await this.appraisalRepository.save(appraisal);
      return result;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async updateAppraisal(
    appraisalId: string,
    updateAppraisalPayload: UpdateAppraisalPayload,
  ): Promise<Appraisal> {
    try {
      const appraisal = await this.appraisalRepository.findOne({
        where: { appraisalId },
      });
      if (!appraisal) {
        throw new NotFoundException('Appraisal not found');
      }
      console.log('updateAppraisalPayload', updateAppraisalPayload);
      const updatedAppraisal = this.appraisalRepository.merge(
        appraisal,
        updateAppraisalPayload,
      );
      return await this.appraisalRepository.save(updatedAppraisal);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
  async deleteAppraisal(appraisalId: string): Promise<void> {
    try {
      const appraisal = await this.appraisalRepository.findOne({
        where: { appraisalId },
      });
      if (!appraisal) {
        throw new NotFoundException('Appraisal not found');
      }
      await this.appraisalRepository.delete(appraisalId);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
