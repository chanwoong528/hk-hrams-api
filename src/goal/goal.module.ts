import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './goal.entity';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { AuthModule } from 'src/auth/auth.module';
import { AppraisalUserModule } from 'src/appraisal-user/appraisal-user.module';
import { DepartmentModule } from 'src/department/department.module';
import { HramsUserDepartmentModule } from 'src/hrams-user-department/hrams-user-department.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Goal]),
    AuthModule,
    AppraisalUserModule,
    DepartmentModule,
    HramsUserDepartmentModule,
  ],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
