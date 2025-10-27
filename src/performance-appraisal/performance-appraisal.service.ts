import { Injectable } from '@nestjs/common';
import { CreatePerformanceAppraisalPayload } from './performance-appraisal.dto';
import { PerformanceAppraisal } from './performance-appraisal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Like, QueryFailedError, Repository } from 'typeorm';

import { CustomException } from 'src/common/exceptions/custom-exception';
import { HramsUserService } from 'src/hrams-user/hrams-user.service';

@Injectable()
export class PerformanceAppraisalService {
  private readonly customException = new CustomException(
    'PerformanceAppraisal',
  );

  constructor(
    @InjectRepository(PerformanceAppraisal)
    private readonly performanceAppraisalRepository: Repository<PerformanceAppraisal>,

    private readonly hrUserService: HramsUserService,
  ) {}

  async getAllPerformanceAppraisals(): Promise<PerformanceAppraisal[]> {
    return await this.performanceAppraisalRepository.find({
      relations: [
        'goals',
        'appraisalBy',
        'appraisalBy.assessedBy',
        'assessTarget',
      ],
    });
  }

  async getAllPerformanceAppraisalByType(
    appraisalType: string,
    page: number = 1,
    limit: number = 10,
    keyword?: string,
  ): Promise<{ list: PerformanceAppraisal[]; total: number }> {
    try {
      const [performanceAppraisals, total] =
        await this.performanceAppraisalRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
          where: {
            appraisalType: appraisalType,
            ...(keyword?.trim() && {
              assessTarget: { koreanName: Like(`%${keyword}%`) },
            }),
          },
          relations: [
            'goals',
            'appraisalBy',
            'appraisalBy.assessedBy',
            'assessTarget',
            'assessTarget.hramsUserDepartments.department',
          ],
        });

      // console.log('performanceAppraisals', performanceAppraisals);

      const list = performanceAppraisals.map((performanceAppraisal) => ({
        ...performanceAppraisal,
        assessTarget: {
          ...performanceAppraisal.assessTarget,
          departments:
            performanceAppraisal.assessTarget.hramsUserDepartments.map(
              (hud) => hud.department,
            ),
        },
      }));

      return {
        list: list,
        total: total,
      };
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getPerformanceAppraisalsByTitle(
    title: string,
  ): Promise<PerformanceAppraisal[]> {
    return await this.performanceAppraisalRepository.find({
      where: { title: Like(`%${title}%`) },
    });
  }

  async getAallCountByDistinctAppraisalType(keyword?: string): Promise<
    {
      appraisalType: string;
      count: number;
    }[]
  > {
    try {
      const qb = this.performanceAppraisalRepository
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

  async createPerformanceAppraisal(
    createPerformanceAppraisalPayload: CreatePerformanceAppraisalPayload,
  ): Promise<PerformanceAppraisal[]> {
    //maybe have to make as message queue to handle many input to be inserted
    try {
      const getAllReviewees = await this.hrUserService.getAllHramsUsersByLv([
        'reviewee',
        'both',
      ]);

      const filteredReviewees = getAllReviewees.filter(
        (reviewee) =>
          !createPerformanceAppraisalPayload.exceptionUserList.includes(
            reviewee.userId,
          ),
      );

      const performanceAppraisals = [];

      for (const reviewee of filteredReviewees) {
        const performanceAppraisalBy =
          this.performanceAppraisalRepository.create({
            title: createPerformanceAppraisalPayload.title,
            appraisalType: createPerformanceAppraisalPayload.appraisalType,
            description: createPerformanceAppraisalPayload.description,
            endDate: createPerformanceAppraisalPayload.endDate,
            assessTarget: { userId: reviewee.userId },
          });

        performanceAppraisals.push(performanceAppraisalBy);
      }

      const result = await this.performanceAppraisalRepository.insert(
        performanceAppraisals,
      );
      return result.generatedMaps as PerformanceAppraisal[];
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
