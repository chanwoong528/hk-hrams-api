import { Test, TestingModule } from '@nestjs/testing';
import { HramsUserDepartmentController } from './hrams-user-department.controller';

describe('HramsUserDepartmentController', () => {
  let controller: HramsUserDepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HramsUserDepartmentController],
    }).compile();

    controller = module.get<HramsUserDepartmentController>(
      HramsUserDepartmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
