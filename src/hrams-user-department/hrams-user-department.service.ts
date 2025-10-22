import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { HramsUserDepartment } from './hrams-user-department.entity';
import { CreateHramsUserDepartmentPayload } from './hrams-user-department.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class HramsUserDepartmentService {
  private readonly customException = new CustomException('HramsUserDepartment');

  constructor(
    @InjectRepository(HramsUserDepartment)
    private readonly hramsUserDepartmentRepository: Repository<HramsUserDepartment>,
  ) {}

  async upsertHramsUserDepartment(
    createHramsUserDepartmentPayload: CreateHramsUserDepartmentPayload,
  ): Promise<HramsUserDepartment> {
    try {
      const result = await this.hramsUserDepartmentRepository.upsert(
        createHramsUserDepartmentPayload,
        ['userId', 'departmentId'],
      );
      return result.generatedMaps[0] as HramsUserDepartment;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
  async getHramsUserDepartmentsByUserId(
    userId: string,
  ): Promise<HramsUserDepartment[]> {
    try {
      const hramsUserDepartments =
        await this.hramsUserDepartmentRepository.find({
          where: { userId },
          relations: ['department'],
        });
      return hramsUserDepartments;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
