import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyAssessmentService } from './competency-assessment.service';

describe('CompetencyAssessmentService', () => {
  let service: CompetencyAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetencyAssessmentService],
    }).compile();

    service = module.get<CompetencyAssessmentService>(CompetencyAssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
