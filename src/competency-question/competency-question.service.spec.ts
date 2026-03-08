import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyQuestionService } from './competency-question.service';

describe('CompetencyQuestionService', () => {
  let service: CompetencyQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetencyQuestionService],
    }).compile();

    service = module.get<CompetencyQuestionService>(CompetencyQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
