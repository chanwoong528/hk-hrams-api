import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { AppraisalBy } from './appraisal-by.entity';
import { CreateAppraisalByPayload } from './appraisal-by.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

import { AppraisalUser } from 'src/appraisal-user/appraisal-user.entity';

@Injectable()
export class AppraisalByService {
  private readonly customException = new CustomException('AppraisalByService');
  constructor(
    @InjectRepository(AppraisalBy)
    private readonly appraisalByRepository: Repository<AppraisalBy>,
    @InjectRepository(AppraisalUser)
    private readonly appraisalUserRepository: Repository<AppraisalUser>,
  ) { }

  async createAppraisalBy(
    createAppraisalByPayload: CreateAppraisalByPayload,
  ): Promise<AppraisalBy> {
    try {
      // Check if already exists
      const existing = await this.appraisalByRepository.findOne({
        where: {
          appraisalId: createAppraisalByPayload.appraisalId,
          assessedById: createAppraisalByPayload.assessedById
        }
      });

      let result;
      if (existing) {
        // Update
        await this.appraisalByRepository.update(existing.appraisalById, createAppraisalByPayload);
        result = await this.appraisalByRepository.findOne({ where: { appraisalById: existing.appraisalById } });
      } else {
        // Create
        const appraisalBy = this.appraisalByRepository.create(
          createAppraisalByPayload,
        );
        result = await this.appraisalByRepository.save(appraisalBy);
      }

      // Update AppraisalUser status to 'submitted' ONLY if the Assessor is the Owner (Self Assessment)
      // We need to check if assessedById matches the owner of appraisalUser

      // Fetch AppraisalUser to check owner
      const appraisalUser = await this.appraisalUserRepository.findOne({
        where: { appraisalUserId: createAppraisalByPayload.appraisalId },
        relations: ['owner']
      });

      if (appraisalUser) {
        if (appraisalUser.owner.userId === createAppraisalByPayload.assessedById) {
          // Self Assessment -> submitted
          await this.appraisalUserRepository.update(
            createAppraisalByPayload.appraisalId,
            { status: 'submitted' },
          );
        } else {
          // Leader Assessment -> finished
          await this.appraisalUserRepository.update(
            createAppraisalByPayload.appraisalId,
            { status: 'finished' },
          );
        }
      }

      return result;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
