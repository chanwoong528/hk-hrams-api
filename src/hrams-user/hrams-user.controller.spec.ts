import { Test, TestingModule } from '@nestjs/testing';
import { HramsUserController } from './hrams-user.controller';

describe('HramsUserController', () => {
  let controller: HramsUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HramsUserController],
    }).compile();

    controller = module.get<HramsUserController>(HramsUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
