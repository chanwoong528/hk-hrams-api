import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HramsUser } from './hrams-user.entity';
import { HramsUserController } from './hrams-user.controller';
import { HramsUserService } from './hrams-user.service';
import { HramsUserDepartmentModule } from 'src/hrams-user-department/hrams-user-department.module';
import { Department } from 'src/department/department.entity';

import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([HramsUser, Department]), HramsUserDepartmentModule],
  controllers: [HramsUserController],
  providers: [HramsUserService, AuthService],
  exports: [HramsUserService],
})
export class HramsUserModule { }
