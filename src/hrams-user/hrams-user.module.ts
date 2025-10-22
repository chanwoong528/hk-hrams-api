import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HramsUser } from './hrams-user.entity';
import { HramsUserController } from './hrams-user.controller';
import { HramsUserService } from './hrams-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([HramsUser])],
  controllers: [HramsUserController],
  providers: [HramsUserService],
  exports: [HramsUserService],
})
export class HramsUserModule {}
