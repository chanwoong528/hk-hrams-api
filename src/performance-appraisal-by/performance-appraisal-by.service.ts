import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { PerformanceAppraisalBy } from './performance-appraisal-by.entity';
import { CreatePerformanceAppraisalByPayload } from './performance-appraisal-by.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class PerformanceAppraisalByService {
  private readonly customException = new CustomException(
    'PerformanceAppraisalByService',
  );
  constructor(
    @InjectRepository(PerformanceAppraisalBy)
    private readonly performanceAppraisalByRepository: Repository<PerformanceAppraisalBy>,
  ) {}

  async createPerformanceAppraisalBy(
    createPerformanceAppraisalByPayload: CreatePerformanceAppraisalByPayload,
  ): Promise<PerformanceAppraisalBy> {
    try {
      const performanceAppraisalBy =
        this.performanceAppraisalByRepository.create(
          createPerformanceAppraisalByPayload,
        );
      return await this.performanceAppraisalByRepository.save(
        performanceAppraisalBy,
      );
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
