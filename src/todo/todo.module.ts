import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { ReviewAssignment } from '../leader-review-assignment/review-assignment.entity';
import { Goal } from '../goal/goal.entity';
import { DepartmentModule } from '../department/department.module';
import { HramsUserDepartmentModule } from '../hrams-user-department/hrams-user-department.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppraisalUser, ReviewAssignment, Goal]),
    DepartmentModule,
    HramsUserDepartmentModule,
    AuthModule,
  ],
  controllers: [TodoController],
  providers: [TodoService],
  exports: [TodoService],
})
export class TodoModule { }
