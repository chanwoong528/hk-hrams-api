import { Test, TestingModule } from '@nestjs/testing';
import { GoalAssessmentByController } from './goal-assessment-by.controller';

describe('GoalAssessmentByController', () => {
  let controller: GoalAssessmentByController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalAssessmentByController],
    }).compile();

    controller = module.get<GoalAssessmentByController>(
      GoalAssessmentByController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
