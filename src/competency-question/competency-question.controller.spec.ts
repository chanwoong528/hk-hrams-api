import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyQuestionController } from './competency-question.controller';

describe('CompetencyQuestionController', () => {
  let controller: CompetencyQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyQuestionController],
    }).compile();

    controller = module.get<CompetencyQuestionController>(CompetencyQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
