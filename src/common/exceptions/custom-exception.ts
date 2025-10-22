import { BadRequestException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import QueryException from './query-exception';

export class CustomException extends BadRequestException {
  private readonly domainName: string;
  private readonly logger = new Logger(CustomException.name);
  constructor(domainName: string) {
    super(`${domainName} exception`);
    this.domainName = domainName;
  }

  public handleException(error: QueryFailedError | Error) {
    if (error instanceof QueryFailedError) {
      const queryException = new QueryException(this.domainName);
      throw new BadRequestException(
        queryException.handleQueryFailedError(error),
      );
    }

    this.logger.error(`${this.domainName} - ${error.message}`);
    throw new BadRequestException(`${this.domainName} - ${error.message}`);
  }
}
