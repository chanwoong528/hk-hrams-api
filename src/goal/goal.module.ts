import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './goal.entity';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goal]), AuthModule],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
