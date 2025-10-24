import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { HramsUserModule } from 'src/hrams-user/hrams-user.module';
import { HramsUserDepartmentModule } from 'src/hrams-user-department/hrams-user-department.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
    HramsUserModule,
    HramsUserDepartmentModule,
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
