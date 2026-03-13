import { Module } from '@nestjs/common';
import { AppraisalUserController } from './appraisal-user.controller';
import { AppraisalUserService } from './appraisal-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppraisalUser } from './appraisal-user.entity';
import { HramsUserModule } from 'src/hrams-user/hrams-user.module';
import { AppraisalModule } from 'src/appraisal/appraisal.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppraisalUser]),
    HramsUserModule,
    AppraisalModule,
    AuthModule,
  ],
  controllers: [AppraisalUserController],
  providers: [AppraisalUserService],
  exports: [AppraisalUserService],
})
export class AppraisalUserModule {}
