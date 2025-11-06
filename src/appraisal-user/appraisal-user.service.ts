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
  ) {}

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

  async getAppraisalUsersByAppraisalId(
    appraisalId: string,
    page: number = 1,
    limit: number = 10,
    keyword?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<{ list: AppraisalUser[]; total: number }> {
    try {
      // console.log('sortBy', sortBy);
      // console.log('sortOrder', sortOrder);
      console.log('keyword', keyword);

      const orderObject = this.setOrderObject(sortBy, sortOrder);

      const queryBuilder = this.appraisalUserRepository
        .createQueryBuilder('appraisalUser')
        .leftJoinAndSelect('appraisalUser.owner', 'owner')
        .leftJoinAndSelect('appraisalUser.appraisal', 'appraisal')
        .leftJoinAndSelect('owner.hramsUserDepartments', 'hramsUserDepartments')
        .leftJoinAndSelect('hramsUserDepartments.department', 'department')
        .where('appraisal.appraisalId = :appraisalId', { appraisalId });

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

      const [appraisalUsers, total] = await queryBuilder.getManyAndCount();

      return {
        list: appraisalUsers.map((appraisalUser) => ({
          ...appraisalUser,
          departments: appraisalUser.owner.hramsUserDepartments.map(
            (hud) => hud.department,
          ),
        })),
        total: total,
      };
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
