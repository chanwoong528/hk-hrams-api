import {
  BadRequestException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import QueryException from './query-exception';
import { TokenExpiredError } from '@nestjs/jwt';

export class CustomException extends BadRequestException {
  private readonly domainName: string;
  private readonly logger = new Logger(CustomException.name);
  constructor(domainName: string) {
    super(`${domainName} exception`);
    this.domainName = domainName;
  }

  public handleException(
    error: QueryFailedError | Error | NotFoundException | UnauthorizedException,
  ) {
    this.logger.error(`${this.domainName} - ${error.message}`);
    if (error instanceof QueryFailedError) {
      const queryException = new QueryException(this.domainName);

      throw new BadRequestException(
        `${this.domainName} - ${queryException.handleQueryFailedError(error)}`,
      );
    }

    if (error instanceof NotFoundException) {
      throw new NotFoundException(`${this.domainName} - ${error.message}`);
    }

    if (error instanceof TokenExpiredError) {
      throw new BadRequestException({
        message: `${this.domainName} - ${error.message}`,
        error: 'Token expired',
        statusCode: 410, //gone may change later
      });
    }

    if (error instanceof UnauthorizedException) {
      throw new BadRequestException({
        message: `${this.domainName} - ${error.message}`,
        error: 'Unauthorized',
        statusCode: 401,
      });
    }

    throw new BadRequestException({
      message: `${this.domainName} - ${error.message}`,
      error: 'Bad Request',
      statusCode: 400,
    });
  }
}
