import { Test, TestingModule } from '@nestjs/testing';
import { AppraisalUserController } from './appraisal-user.controller';

describe('AppraisalUserController', () => {
  let controller: AppraisalUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppraisalUserController],
    }).compile();

    controller = module.get<AppraisalUserController>(AppraisalUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
