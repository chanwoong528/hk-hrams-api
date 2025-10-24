import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryFailedError, Repository } from 'typeorm';

import { HramsUser } from './hrams-user.entity';
import {
  CreateHramsUserPayload,
  HramsUserWithDepartments,
  UpdateHramsUserPayload,
} from './hrams-user.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { HramsUserDepartmentService } from 'src/hrams-user-department/hrams-user-department.service';

@Injectable()
export class HramsUserService {
  private readonly customException = new CustomException('HramsUser');

  constructor(
    @InjectRepository(HramsUser)
    private readonly hrUserRepository: Repository<HramsUser>,
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
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
        userStatus: hrUser.userStatus,
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
      const savedHrUser = await this.hrUserRepository.save(hrUser);

      if (createHramsUserPayload.departments) {
        await Promise.all(
          createHramsUserPayload.departments.map(
            async (departmentId: string) => {
              await this.hramsUserDepartmentService.upsertHramsUserDepartment({
                userId: savedHrUser.userId,
                departmentId: departmentId,
              });
            },
          ),
        );
      }

      return savedHrUser;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getHramsUserById(userId: string): Promise<HramsUser> {
    try {
      const hrUser = await this.hrUserRepository.findOne({
        where: { userId },
        relations: ['hramsUserDepartments', 'hramsUserDepartments.department'],
      });

      return hrUser;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async updateHramsUserById(
    userId: string,
    updateHramsUserPayload: UpdateHramsUserPayload,
  ): Promise<HramsUser> {
    try {
      const { tobeDeletedDepartments, tobeAddedDepartments, ...rest } =
        updateHramsUserPayload;

      if (tobeAddedDepartments) {
        await Promise.all(
          tobeAddedDepartments.map(async (departmentId: string) => {
            await this.hramsUserDepartmentService.upsertHramsUserDepartment({
              userId: userId,
              departmentId: departmentId,
            });
          }),
        );
      }

      if (tobeDeletedDepartments) {
        await Promise.all(
          tobeDeletedDepartments.map(async (departmentId: string) => {
            await this.hramsUserDepartmentService.deleteHramsUserDepartment({
              userId: userId,
              departmentId: departmentId,
            });
          }),
        );
      }

      const result = await this.hrUserRepository.update({ userId }, rest);
      return result.generatedMaps[0] as HramsUser;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
