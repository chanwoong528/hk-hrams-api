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
        relations: ['appraisalUsers', 'appraisalUsers.appraisal'],
      });

      console.log('appraisals>> ', appraisals);

      return appraisals;
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
