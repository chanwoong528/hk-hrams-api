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

@Injectable()
export class AppraisalService {
  private readonly customException = new CustomException('Appraisal');

  constructor(
    @InjectRepository(Appraisal)
    private readonly appraisalRepository: Repository<Appraisal>,
  ) {}

  async getAppraisalTeamMembers(
    departments: string[],
  ): Promise<FormattedAppraisal[][]> {
    const teamMembers = await Promise.all(
      departments.map((departmentId) => {
        return this.getAppraisalTeamMembersByAppraisalId(departmentId);
      }),
    );

    return teamMembers;
  }
  async getAppraisalTeamMembersByAppraisalId(
    departmentId: string,
  ): Promise<FormattedAppraisal[]> {
    const appraisal = await this.appraisalRepository
      .createQueryBuilder('appraisal')
      .leftJoin('appraisal.appraisalUsers', 'appraisalUser')
      .leftJoin('appraisalUser.owner', 'owner')
      .leftJoin('owner.hramsUserDepartments', 'hud')
      .leftJoin('hud.department', 'department')
      .leftJoin('appraisalUser.goals', 'goals')
      .where('appraisal.status = :status', { status: 'ongoing' })
      .andWhere('department.departmentId = :departmentId', { departmentId })
      .select([
        'appraisal',
        'goals',
        'owner.userId',
        'owner.koreanName',
        'department.departmentName',
      ])
      .getRawMany();
    if (!appraisal || appraisal.length === 0) {
      throw new NotFoundException('Appraisal not found');
    }

    return this.formatAppraisal(appraisal);
  }

  private formatAppraisal(appraisal: RawAppraisalRow[]): FormattedAppraisal[] {
    return Object.values(
      appraisal.reduce(
        (acc: Record<string, FormattedAppraisal>, row: RawAppraisalRow) => {
          const id = row.appraisal_appraisalId;

          if (!acc[id]) {
            acc[id] = {
              appraisalId: id,
              appraisalType: row.appraisal_appraisalType,
              title: row.appraisal_title,
              description: row.appraisal_description,
              endDate: row.appraisal_endDate,
              status: row.appraisal_status,
              // created: row.appraisal_created,
              // updated: row.appraisal_updated,
              departmentName: row.department_departmentName,
              users: [],
            };
          }

          acc[id].users.push({
            appraisalUserId: row.appraisalUser_appraisalUserId,
            status: row.appraisalUser_status,
            userId: row.owner_userId,
            koreanName: row.owner_koreanName,
            goals:
              row.goals_goalId &&
              row.goals_title &&
              row.goals_description &&
              row.goals_created &&
              row.goals_updated
                ? [
                    {
                      goalId: row.goals_goalId,
                      title: row.goals_title,
                      description: row.goals_description,
                      created: row.goals_created,
                      updated: row.goals_updated,
                    },
                  ]
                : [],
          });

          return acc;
        },
        {},
      ),
    );
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
  ): Promise<{ list: Appraisal[]; total: number }> {
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

      const list = appraisals.map((appraisal) => ({
        ...appraisal,
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
          'appraisalUsers.goals',
        ],
      });

      return appraisals.map((appraisal) => ({
        ...appraisal,
        goals: appraisal.appraisalUsers.flatMap(
          (appraisalUser) => appraisalUser.goals,
        ),
      }));
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
  ): Promise<Appraisal> {
    //maybe have to make as message queue to handle many input to be inserted
    try {
      const appraisal = this.appraisalRepository.create({
        title: createAppraisalPayload.title,
        appraisalType: createAppraisalPayload.appraisalType,
        description: createAppraisalPayload.description,
        endDate: createAppraisalPayload.endDate,
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
}
