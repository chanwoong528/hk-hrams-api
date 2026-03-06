import { Injectable } from '@nestjs/common';
import { AppraisalUser } from './appraisal-user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateAppraisalUserPayload } from './appraisal-user.dto';
import { HramsUserService } from 'src/hrams-user/hrams-user.service';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class AppraisalUserService {
  private readonly customException = new CustomException('AppraisalUser');
  constructor(
    @InjectRepository(AppraisalUser)
    private readonly appraisalUserRepository: Repository<AppraisalUser>,

    private readonly hramsUserService: HramsUserService,
  ) { }

  async createAppraisalUser(
    appraisalId: string,
    ownerId: string,
  ): Promise<AppraisalUser> {
    const appraisalUser = this.appraisalUserRepository.create({
      appraisal: { appraisalId },
      owner: { userId: ownerId },
    });
    return await this.appraisalUserRepository.save(appraisalUser);
  }

  async createAppraisalFilteredUsers(
    createAppraisalUserPayload: CreateAppraisalUserPayload,
  ): Promise<AppraisalUser[]> {
    try {
      const users = await this.hramsUserService.getAllHramsUsersByLv([
        'reviewee',
        'both',
      ]);
      const filteredUsers = users.filter(
        (user) =>
          !createAppraisalUserPayload.exceptionUserList.includes(user.userId),
      );

      const appraisalUsers = filteredUsers.map((user) => {
        return this.appraisalUserRepository.create({
          appraisal: { appraisalId: createAppraisalUserPayload.appraisalId },
          owner: { userId: user.userId },
        });
      });

      return await this.appraisalUserRepository.save(appraisalUsers);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  private setOrderObject(
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ): { owner?: { koreanName: 'ASC' | 'DESC' } } | null {
    if (sortBy === 'owner') {
      return {
        owner: {
          koreanName: sortOrder === 'asc' ? 'ASC' : 'DESC',
        },
      };
    }
    return null;
  }

  async getAppraisalUserByUserIdAndAppraisalId(
    userId: string,
    appraisalId: string,
  ): Promise<AppraisalUser> {
    try {
      return await this.appraisalUserRepository.findOne({
        where: { owner: { userId }, appraisal: { appraisalId } },
      });
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getAppraisalUsersByAppraisalId(
    appraisalId: string,
    page: number = 1,
    limit: number = 10,
    keyword?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<{ list: AppraisalUser[]; total: number }> {
    try {
      const orderObject = this.setOrderObject(sortBy, sortOrder);

      const queryBuilder = this.appraisalUserRepository
        .createQueryBuilder('appraisalUser')
        .leftJoinAndSelect('appraisalUser.owner', 'owner')
        .leftJoinAndSelect('appraisalUser.appraisal', 'appraisal')
        .leftJoinAndSelect('owner.hramsUserDepartments', 'hramsUserDepartments')
        .leftJoinAndSelect('hramsUserDepartments.department', 'department')
        // Join for competency assessment progress (self-assessment only)
        .leftJoin('appraisalUser.competencyAssessments', 'ca', 'ca.evaluatorId = owner.userId')
        .addSelect('COUNT(ca.assessmentId)', 'competencyTotal')
        .addSelect('COUNT(CASE WHEN ca.grade IS NOT NULL THEN 1 END)', 'competencySubmitted')
        .where('appraisal.appraisalId = :appraisalId', { appraisalId })
        .addGroupBy('appraisalUser.appraisalUserId')
        .addGroupBy('owner.userId')
        .addGroupBy('appraisal.appraisalId')
        .addGroupBy('"hramsUserDepartments"."hramsUserDepartmentId"')
        .addGroupBy('department.departmentId');

      if (keyword?.trim()) {
        // console.log('keyword', keyword);
        queryBuilder.andWhere('owner.koreanName LIKE :keyword', {
          keyword: `%${keyword}%`,
        });
      }

      if (orderObject?.owner?.koreanName) {
        queryBuilder.orderBy('owner.koreanName', orderObject.owner.koreanName);
      }

      queryBuilder.skip((page - 1) * limit).take(limit);

      // We use getRawAndEntities to retrieve raw aggregations alongside entities
      const { entities, raw } = await queryBuilder.getRawAndEntities();

      // Still need a separate count query since getRawAndEntities limits apply to the grouped result, but TypeORM's count() handles this poorly with groupBy.
      // So we count without the grouping/joins that multiply rows just to get the distinct appraisalUser count.
      const countQuery = this.appraisalUserRepository
        .createQueryBuilder('appraisalUser')
        .leftJoin('appraisalUser.owner', 'owner')
        .where('appraisalUser.appraisalId = :appraisalId', { appraisalId });

      if (keyword?.trim()) {
        countQuery.andWhere('owner.koreanName LIKE :keyword', {
          keyword: `%${keyword}%`,
        });
      }
      const total = await countQuery.getCount();

      return {
        list: entities.map((appraisalUser) => {
          // Find matching raw result for this entity
          const rawItem = raw.find((r) => r.appraisalUser_appraisalUserId === appraisalUser.appraisalUserId);
          const compTotal = rawItem ? parseInt(rawItem.competencyTotal || '0', 10) : 0;
          const compSubmitted = rawItem ? parseInt(rawItem.competencySubmitted || '0', 10) : 0;

          return {
            ...appraisalUser,
            departments: appraisalUser.owner.hramsUserDepartments?.map(
              (hud) => hud.department,
            ) || [],
            competencyTotal: compTotal,
            competencySubmitted: compSubmitted,
          };
        }),
        total: total,
      };
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async updateAppraisalUser(
    appraisalUserId: string,
    updateData: Partial<AppraisalUser>,
  ): Promise<AppraisalUser> {
    try {
      await this.appraisalUserRepository.update(appraisalUserId, updateData);
      return await this.appraisalUserRepository.findOne({
        where: { appraisalUserId },
      });
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
