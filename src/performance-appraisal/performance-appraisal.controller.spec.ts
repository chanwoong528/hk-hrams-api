import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceAppraisalController } from './performance-appraisal.controller';

describe('PerformanceAppraisalController', () => {
  let controller: PerformanceAppraisalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceAppraisalController],
    }).compile();

    controller = module.get<PerformanceAppraisalController>(
      PerformanceAppraisalController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
