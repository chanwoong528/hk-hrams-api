import { Module, forwardRef } from '@nestjs/common';
import { HramsUserDepartmentService } from './hrams-user-department.service';
import { HramsUserDepartmentController } from './hrams-user-department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HramsUserDepartment } from './hrams-user-department.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HramsUserDepartment]),
    forwardRef(() => AuthModule),
  ],
  providers: [HramsUserDepartmentService],
  exports: [HramsUserDepartmentService],
  controllers: [HramsUserDepartmentController],
})
export class HramsUserDepartmentModule {}
