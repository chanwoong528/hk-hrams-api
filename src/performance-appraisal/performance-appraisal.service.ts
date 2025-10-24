import { Injectable } from '@nestjs/common';
import { CreatePerformanceAppraisalPayload } from './performance-appraisal.dto';
import { PerformanceAppraisal } from './performance-appraisal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class PerformanceAppraisalService {
  private readonly customException = new CustomException(
    'PerformanceAppraisal',
  );

  constructor(
    @InjectRepository(PerformanceAppraisal)
    private readonly performanceAppraisalRepository: Repository<PerformanceAppraisal>,
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

  async createPerformanceAppraisal(
    createPerformanceAppraisalPayload: CreatePerformanceAppraisalPayload,
  ): Promise<PerformanceAppraisal> {
    try {
      const performanceAppraisal = this.performanceAppraisalRepository.create(
        createPerformanceAppraisalPayload,
      );
      return await this.performanceAppraisalRepository.save(
        performanceAppraisal,
      );
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
