import { Module } from '@nestjs/common';
import { AppraisalUserController } from './appraisal-user.controller';
import { AppraisalUserService } from './appraisal-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppraisalUser } from './appraisal-user.entity';
import { HramsUserModule } from 'src/hrams-user/hrams-user.module';
import { AppraisalModule } from 'src/appraisal/appraisal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppraisalUser]),
    HramsUserModule,
    AppraisalModule,
  ],
  controllers: [AppraisalUserController],
  providers: [AppraisalUserService],
  exports: [AppraisalUserService],
})
export class AppraisalUserModule {}
