import { Module } from '@nestjs/common';
import { AppraisalByController } from './appraisal-by.controller';
import { AppraisalByService } from './appraisal-by.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppraisalBy } from './appraisal-by.entity';
import { AppraisalUserModule } from '../appraisal-user/appraisal-user.module';

import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppraisalBy, AppraisalUser]),
    AppraisalUserModule,
  ],
  controllers: [AppraisalByController],
  providers: [AppraisalByService],
})
export class AppraisalByModule { }
