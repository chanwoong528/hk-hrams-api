import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appraisal } from './appraisal.entity';
import { AppraisalController } from './appraisal.controller';
import { AppraisalService } from './appraisal.service';
import { AuthModule } from 'src/auth/auth.module';

import { DepartmentModule } from 'src/department/department.module';

import { HramsUserModule } from 'src/hrams-user/hrams-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appraisal]), AuthModule, DepartmentModule, HramsUserModule],
  controllers: [AppraisalController],
  providers: [AppraisalService],
  exports: [AppraisalService],
})
export class AppraisalModule { }
