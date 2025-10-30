import { Module } from '@nestjs/common';
import { AppraisalByController } from './appraisal-by.controller';
import { AppraisalByService } from './appraisal-by.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppraisalBy } from './appraisal-by.entity';
import { AppraisalUserModule } from '../appraisal-user/appraisal-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppraisalBy]), AppraisalUserModule],
  controllers: [AppraisalByController],
  providers: [AppraisalByService],
})
export class AppraisalByModule {}
