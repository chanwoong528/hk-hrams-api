import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './goal.entity';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { AuthModule } from 'src/auth/auth.module';
import { AppraisalUserModule } from 'src/appraisal-user/appraisal-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goal]), AuthModule, AppraisalUserModule],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
