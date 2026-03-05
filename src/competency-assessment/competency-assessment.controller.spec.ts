import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyAssessmentController } from './competency-assessment.controller';

describe('CompetencyAssessmentController', () => {
  let controller: CompetencyAssessmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyAssessmentController],
    }).compile();

    controller = module.get<CompetencyAssessmentController>(CompetencyAssessmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
