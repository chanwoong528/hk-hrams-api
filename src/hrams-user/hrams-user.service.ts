import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryFailedError, Repository } from 'typeorm';

import { HramsUser } from './hrams-user.entity';
import {
  CreateHramsUserPayload,
  HramsUserWithDepartments,
  UpdateHramsUserPayload,
} from './hrams-user.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { HramsUserDepartmentService } from 'src/hrams-user-department/hrams-user-department.service';
import { Department } from 'src/department/department.entity';

import userDemoData from '../../mock/hrams_users_300.json';
import { generateHashPassword } from 'src/common/utils/hash';

@Injectable()
export class HramsUserService {
  private readonly customException = new CustomException('HramsUser');

  constructor(
    @InjectRepository(HramsUser)
    private readonly hrUserRepository: Repository<HramsUser>,
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
    private readonly dataSource: DataSource,
  ) { }

  async getAllHramsUsersByKeyword(keyword: string): Promise<{
    list: HramsUserWithDepartments[];
    total: number;
  }> {
    try {
      if (keyword === 'all') {
        const [allHrUsers, total] = await this.hrUserRepository.findAndCount({
          relations: [
            'hramsUserDepartments',
            'hramsUserDepartments.department',
          ],
          order: { created: 'DESC' },
        });
        return {
          list: allHrUsers as HramsUserWithDepartments[],
          total: total,
        };
      }

      const [hrUsers, total] = await this.hrUserRepository.findAndCount({
        where: [
          { koreanName: Like(`%${keyword}%`) },
          { email: Like(`%${keyword}%`) },
        ],
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
  async getAllHramsUsersByPagination(
    page: number,
    limit: number,
    keyword?: string,
    departmentId?: string,
  ): Promise<{
    list: HramsUserWithDepartments[];
    total: number;
  }> {
    try {
      const qb = this.hrUserRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.hramsUserDepartments', 'hud')
        .leftJoinAndSelect('hud.department', 'department')
        .orderBy('user.created', 'DESC');

      if (keyword?.trim()) {
        qb.andWhere(
          '(user.koreanName LIKE :keyword OR user.email LIKE :keyword)',
          { keyword: `%${keyword}%` },
        );
      }

      if (departmentId?.trim()) {
        // Use recursive CTE to find selected department + all descendants
        const descendantRows = await this.dataSource.query(
          `WITH RECURSIVE dept_tree AS (
             SELECT "departmentId" FROM department WHERE "departmentId" = $1
             UNION ALL
             SELECT d."departmentId" FROM department d
             INNER JOIN dept_tree dt ON d."parentDepartmentId" = dt."departmentId"
           )
           SELECT "departmentId" FROM dept_tree`,
          [departmentId],
        );

        const allDeptIds = descendantRows.map(
          (r: any) => r.departmentId,
        );

        if (allDeptIds.length > 0) {
          qb.andWhere(
            `EXISTS (
              SELECT 1 FROM hrams_user_department hud_filter 
              WHERE hud_filter."userId" = "user"."userId" 
              AND hud_filter."departmentId" IN (:...allDeptIds)
            )`,
            { allDeptIds },
          );
        } else {
          qb.andWhere(
            `EXISTS (
              SELECT 1 FROM hrams_user_department hud_filter 
              WHERE hud_filter."userId" = "user"."userId" 
              AND hud_filter."departmentId" = :departmentId
            )`,
            { departmentId },
          );
        }
      }

      qb.skip((page - 1) * limit).take(limit);

      const [hrUsers, total] = await qb.getManyAndCount();
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

  async getHramsUserByEmail(email: string): Promise<HramsUser> {
    try {
      const hrUser = await this.hrUserRepository.findOne({
        where: { email },
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

  async getAllHramsUsersByLv(lv: string[]): Promise<HramsUser[]> {
    try {
      return await this.hrUserRepository.find({
        where: { lv: In(lv) },
      });
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
      return [];
    }
  }

  async getAllLeaders(): Promise<HramsUser[]> {
    try {
      const hramsUserDepartments = await this.hramsUserDepartmentService.getAllHramsUserDepartmentByIsLeader(true);
      // Dedup users just in case they are leaders of multiple departments
      const leadersMap = new Map<string, HramsUser>();
      hramsUserDepartments.forEach(hud => {
        if (hud.user) {
          leadersMap.set(hud.user.userId, hud.user);
        }
      });
      return Array.from(leadersMap.values());
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
      return [];
    }
  }

  async getTeamMembersOfLeader(leaderId: string): Promise<HramsUser[]> {
    try {
      // 1. Find departments where this user is a leader
      const leaderDepts = await this.hramsUserDepartmentService.getHramsUserDepartmentsByUserId(leaderId);
      const leadingDeptIds = leaderDepts
        .filter(hud => hud.isLeader)
        .map(hud => hud.departmentId);

      if (leadingDeptIds.length === 0) return [];

      // 2. Find all users in these departments
      const membersMap = new Map<string, HramsUser>();

      await Promise.all(leadingDeptIds.map(async (deptId) => {
        const members = await this.hramsUserDepartmentService.getHramsUsersByDepartmentId(deptId);
        members.forEach(m => {
          if (m.userId !== leaderId) { // Exclude the leader themselves
            membersMap.set(m.userId, m);
          }
        });
      }));

      return Array.from(membersMap.values());
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
      return [];
    }
  }

  async createHramsUser(
    createHramsUserPayload: CreateHramsUserPayload,
  ): Promise<HramsUser> {
    try {
      const hashedPassword = await generateHashPassword(
        createHramsUserPayload.pw || '1234',
      );
      const hrUser = this.hrUserRepository.create({
        ...createHramsUserPayload,
        pw: hashedPassword,
      });
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

  async createBulkHramsUsers(
    payloads: CreateHramsUserPayload[],
  ): Promise<HramsUser[]> {
    const results: HramsUser[] = [];
    for (const payload of payloads) {
      const user = await this.createHramsUser(payload);
      results.push(user);
    }
    return results;
  }

  //DEMO DATA Area

  async createDemoBulkHramsUsers(): Promise<HramsUser[]> {
    const hashedPassword = await generateHashPassword('1234');

    try {
      const hrUsers = userDemoData.map((user) => {
        return this.hrUserRepository.create({
          koreanName: user.koreanName.replace(/\s+/g, ''),
          email: user.email,
          pw: hashedPassword,
        });
      });
      return await this.hrUserRepository.save(hrUsers);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
      return [];
    }
  }
}
