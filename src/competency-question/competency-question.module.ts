import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyQuestionController } from './competency-question.controller';
import { CompetencyQuestionService } from './competency-question.service';
import { CompetencyQuestion } from './competency-question.entity';
import { CompetencyAssessment } from '../competency-assessment/competency-assessment.entity';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetencyQuestion,
      CompetencyAssessment,
      AppraisalUser,
    ]),
    AuthModule,
  ],
  controllers: [CompetencyQuestionController],
  providers: [CompetencyQuestionService],
})
export class CompetencyQuestionModule {}
