import { BadRequestException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export class QueryException extends BadRequestException {
  private readonly logger = new Logger(QueryException.name);
  private readonly domainName: string;

  constructor(domainName: string) {
    super(`${domainName} query exception`);
    this.domainName = domainName;
  }
  public handleQueryFailedError(error: QueryFailedError | Error) {
    this.logger.error(`${this.domainName} - ${error.message}`);
    if (error.message.includes('duplicate key')) {
      return `${this.domainName} - Duplicate key error \n\n${error.message}`;
    }
    if (error.message.includes('foreign key')) {
      return `${this.domainName} - Foreign key error \n\n${error.message}`;
    }
    if (error.message.includes('not-null')) {
      return `${this.domainName} - some field is required \n${error.message}`;
    }

    this.logger.error(`${this.domainName} - ${error.message}`);
    return `${this.domainName} - Database error`;
  }
}

export default QueryException;
