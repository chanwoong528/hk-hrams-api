import { Module } from '@nestjs/common';
import { GoalAssessmentByController } from './goal-assessment-by.controller';
import { GoalAssessmentByService } from './goal-assessment-by.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalAssessmentBy } from './goal-assessment-by.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [GoalAssessmentByController],
  providers: [GoalAssessmentByService],
  imports: [TypeOrmModule.forFeature([GoalAssessmentBy]), AuthModule],
  exports: [GoalAssessmentByService],
})
export class GoalAssessmentByModule {}
