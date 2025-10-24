import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryFailedError, Repository } from 'typeorm';

import { HramsUser } from './hrams-user.entity';
import {
  CreateHramsUserPayload,
  HramsUserWithDepartments,
} from './hrams-user.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class HramsUserService {
  private readonly customException = new CustomException('HramsUser');

  constructor(
    @InjectRepository(HramsUser)
    private readonly hrUserRepository: Repository<HramsUser>,
  ) {}

  async getAllHramsUsersByKeyword(keyword: string): Promise<HramsUser[]> {
    try {
      const hrUsers = await this.hrUserRepository.find({
        where: [
          { koreanName: Like(`%${keyword}%`) },
          { email: Like(`%${keyword}%`) },
        ],
      });
      return hrUsers;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
  async getAllHramsUsersByPagination(
    page: number,
    limit: number,
  ): Promise<{
    list: HramsUserWithDepartments[];
    total: number;
  }> {
    try {
      const [hrUsers, total] = await this.hrUserRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['hramsUserDepartments', 'hramsUserDepartments.department'],
        order: { created: 'DESC' },
      });
      const list = hrUsers.map((hrUser) => ({
        userId: hrUser.userId,
        koreanName: hrUser.koreanName,
        email: hrUser.email,
        created: hrUser.created,
        updated: hrUser.updated,
        departments: hrUser.hramsUserDepartments.map((hud) => hud.department),
      })) as HramsUserWithDepartments[];

      return {
        list,
        total: total,
      };
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async createHramsUser(
    createHramsUserPayload: CreateHramsUserPayload,
  ): Promise<HramsUser> {
    try {
      const hrUser = this.hrUserRepository.create(createHramsUserPayload);
      return await this.hrUserRepository.save(hrUser);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
