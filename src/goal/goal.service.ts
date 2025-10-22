import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalPayload } from './goal.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);
  private readonly customException = new CustomException('Goal');

  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  async createGoal(createGoalPayload: CreateGoalPayload): Promise<Goal> {
    try {
      const goal = this.goalRepository.create(createGoalPayload);
      return await this.goalRepository.save(goal);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getGoal(goalId: string): Promise<Goal> {
    try {
      const goal = await this.goalRepository.findOne({
        where: { goalId },
        relations: ['goalAssessmentBy'], // Include related data if needed
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      return goal;
    } catch (error) {
      this.logger.error(`Failed to get goal ${goalId}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve goal');
    }
  }

  async getAllGoals(): Promise<Goal[]> {
    //TODO: order maybe or paging
    try {
      return await this.goalRepository.find({
        relations: ['goalAssessmentBy'],
        order: { created: 'DESC' },
      });
    } catch (error) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
