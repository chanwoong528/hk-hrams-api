import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { AppraisalBy } from './appraisal-by.entity';
import { CreateAppraisalByPayload } from './appraisal-by.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class AppraisalByService {
  private readonly customException = new CustomException('AppraisalByService');
  constructor(
    @InjectRepository(AppraisalBy)
    private readonly appraisalByRepository: Repository<AppraisalBy>,
  ) {}

  async createAppraisalBy(
    createAppraisalByPayload: CreateAppraisalByPayload,
  ): Promise<AppraisalBy> {
    try {
      const appraisalBy = this.appraisalByRepository.create(
        createAppraisalByPayload,
      );
      return await this.appraisalByRepository.save(appraisalBy);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
