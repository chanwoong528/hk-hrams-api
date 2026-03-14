import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyTemplate } from './competency-template.entity';
import { CompetencyTemplateQuestion } from './competency-template-question.entity';
import { CompetencyTemplateService } from './competency-template.service';
import { CompetencyTemplateController } from './competency-template.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetencyTemplate, CompetencyTemplateQuestion]),
    AuthModule,
  ],
  controllers: [CompetencyTemplateController],
  providers: [CompetencyTemplateService],
  exports: [CompetencyTemplateService],
})
export class CompetencyTemplateModule {}
