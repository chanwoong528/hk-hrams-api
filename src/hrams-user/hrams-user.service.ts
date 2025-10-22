import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { HramsUser } from './hrams-user.entity';
import { CreateHramsUserPayload } from './hrams-user.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class HramsUserService {
  private readonly customException = new CustomException('HramsUser');

  constructor(
    @InjectRepository(HramsUser)
    private readonly hrUserRepository: Repository<HramsUser>,
  ) {}

  async createHramsUser(
    createHramsUserPayload: CreateHramsUserPayload,
  ): Promise<HramsUser> {
    try {
      const hrUser = this.hrUserRepository.create(createHramsUserPayload);
      return await this.hrUserRepository.save(hrUser);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
