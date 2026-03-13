import { DocumentBuilder } from '@nestjs/swagger';

export class BaseAPIDocument {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('HK-HRAMS API')
      .setDescription(
        '한국일보 인사평가 관리 시스템(HK Human Resources Appraisal Management System) API 문서입니다.',
      )
      .setVersion('0.0.1')
      .addTag('HK Human Resources')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token', 
      )
      .build();
  }
}
