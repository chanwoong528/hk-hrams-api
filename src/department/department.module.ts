import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { HramsUserModule } from 'src/hrams-user/hrams-user.module';

import { HramsUserDepartmentModule } from 'src/hrams-user-department/hrams-user-department.module';

import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
    AuthModule,
    HramsUserModule,
    HramsUserDepartmentModule,
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
