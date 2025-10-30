import { Test, TestingModule } from '@nestjs/testing';
import { AppraisalByController } from './appraisal-by.controller';

describe('AppraisalByController', () => {
  let controller: AppraisalByController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppraisalByController],
    }).compile();

    controller = module.get<AppraisalByController>(AppraisalByController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
