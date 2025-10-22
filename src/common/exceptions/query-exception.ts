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
    if (error.message.includes('duplicate key')) {
      return `${this.domainName} - Duplicate key error`;
    }
    if (error.message.includes('foreign key')) {
      return `${this.domainName} - Foreign key error`;
    }
    if (error.message.includes('not null')) {
      return `${this.domainName} - Not null error`;
    }

    this.logger.error(`${this.domainName} - ${error.message}`);
    return `${this.domainName} - Database error`;
  }
}

export default QueryException;
