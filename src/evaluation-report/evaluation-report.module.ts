import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationReportController } from './evaluation-report.controller';
import { EvaluationReportService } from './evaluation-report.service';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { AppraisalBy } from '../appraisal-by/appraisal-by.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AppraisalUser, AppraisalBy]),
        AuthModule,
    ],
    controllers: [EvaluationReportController],
    providers: [EvaluationReportService],
})
export class EvaluationReportModule { }
