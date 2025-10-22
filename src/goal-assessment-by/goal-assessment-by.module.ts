import { Module } from '@nestjs/common';
import { GoalAssessmentByController } from './goal-assessment-by.controller';
import { GoalAssessmentByService } from './goal-assessment-by.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalAssessmentBy } from './goal-assessment-by.entity';

@Module({
  controllers: [GoalAssessmentByController],
  providers: [GoalAssessmentByService],
  imports: [TypeOrmModule.forFeature([GoalAssessmentBy])],
  exports: [GoalAssessmentByService],
})
export class GoalAssessmentByModule {}
