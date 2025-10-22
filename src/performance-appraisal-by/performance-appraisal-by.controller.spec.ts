import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceAppraisalByController } from './performance-appraisal-by.controller';

describe('PerformanceAppraisalByController', () => {
  let controller: PerformanceAppraisalByController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceAppraisalByController],
    }).compile();

    controller = module.get<PerformanceAppraisalByController>(
      PerformanceAppraisalByController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
