import { Module } from '@nestjs/common';
import { PerformanceAppraisalByController } from './performance-appraisal-by.controller';
import { PerformanceAppraisalByService } from './performance-appraisal-by.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PerformanceAppraisalBy } from './performance-appraisal-by.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceAppraisalBy])],
  controllers: [PerformanceAppraisalByController],
  providers: [PerformanceAppraisalByService],
})
export class PerformanceAppraisalByModule {}
