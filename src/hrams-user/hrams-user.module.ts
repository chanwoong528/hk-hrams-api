import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HramsUser } from './hrams-user.entity';
import { HramsUserController } from './hrams-user.controller';
import { HramsUserService } from './hrams-user.service';
import { HramsUserDepartmentModule } from 'src/hrams-user-department/hrams-user-department.module';

@Module({
  imports: [TypeOrmModule.forFeature([HramsUser]), HramsUserDepartmentModule],
  controllers: [HramsUserController],
  providers: [HramsUserService],
  exports: [HramsUserService],
})
export class HramsUserModule {}
