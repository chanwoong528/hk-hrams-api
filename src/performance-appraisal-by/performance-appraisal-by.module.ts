import { Module } from '@nestjs/common';
import { PerformanceAppraisalByController } from './performance-appraisal-by.controller';
import { PerformanceAppraisalByService } from './performance-appraisal-by.service';

@Module({
  controllers: [PerformanceAppraisalByController],
  providers: [PerformanceAppraisalByService],
})
export class PerformanceAppraisalByModule {}
