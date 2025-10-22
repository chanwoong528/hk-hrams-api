import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceAppraisal } from './performance-appraisal.entity';
import { PerformanceAppraisalController } from './performance-appraisal.controller';
import { PerformanceAppraisalService } from './performance-appraisal.service';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceAppraisal])],
  controllers: [PerformanceAppraisalController],
  providers: [PerformanceAppraisalService],
  exports: [PerformanceAppraisalService],
})
export class PerformanceAppraisalModule {}
