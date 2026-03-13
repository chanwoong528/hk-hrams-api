import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HramsUser } from './hrams-user.entity';
import { HramsUserController } from './hrams-user.controller';
import { HramsUserService } from './hrams-user.service';
import { HramsUserDepartmentModule } from 'src/hrams-user-department/hrams-user-department.module';
import { Department } from 'src/department/department.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HramsUser, Department]),
    HramsUserDepartmentModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [HramsUserController],
  providers: [HramsUserService],
  exports: [HramsUserService],
})
export class HramsUserModule { }
