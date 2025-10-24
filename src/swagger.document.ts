import { DocumentBuilder } from '@nestjs/swagger';

export class BaseAPIDocument {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('HK-HRAMS API')
      .setDescription(
        'HK Human Resources Appraisal Management System API description',
      )
      .setVersion('0.0.1')
      .addTag('HK Human Resources')
      .build();
  }
}
