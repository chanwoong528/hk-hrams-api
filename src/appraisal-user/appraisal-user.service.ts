import { Injectable } from '@nestjs/common';
import { AppraisalUser } from './appraisal-user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryFailedError, Repository } from 'typeorm';
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

  async getAppraisalUsersByAppraisalId(
    appraisalId: string,
    page: number = 1,
    limit: number = 10,
    keyword?: string,
  ): Promise<{ list: AppraisalUser[]; total: number }> {
    try {
      const [appraisalUsers, total] =
        await this.appraisalUserRepository.findAndCount({
          where: {
            appraisal: { appraisalId },
            ...(keyword?.trim() && {
              owner: { koreanName: Like(`%${keyword}%`) },
            }),
          },
          relations: [
            'owner',
            'appraisal',
            'owner.hramsUserDepartments',
            'owner.hramsUserDepartments.department',
          ],
          skip: (page - 1) * limit,
          take: limit,
        });
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
