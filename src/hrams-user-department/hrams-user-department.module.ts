import { Module } from '@nestjs/common';
import { HramsUserDepartmentService } from './hrams-user-department.service';
import { HramsUserDepartmentController } from './hrams-user-department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HramsUserDepartment } from './hrams-user-department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HramsUserDepartment])],
  providers: [HramsUserDepartmentService],
  exports: [HramsUserDepartmentService],
  controllers: [HramsUserDepartmentController],
})
export class HramsUserDepartmentModule {}
