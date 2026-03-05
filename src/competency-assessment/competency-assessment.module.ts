import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyAssessmentController } from './competency-assessment.controller';
import { CompetencyAssessmentService } from './competency-assessment.service';
import { CompetencyAssessment } from './competency-assessment.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompetencyAssessment]), AuthModule],
  controllers: [CompetencyAssessmentController],
  providers: [CompetencyAssessmentService],
})
export class CompetencyAssessmentModule {}
