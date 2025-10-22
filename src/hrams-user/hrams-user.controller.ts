import { Controller, Post, Body } from '@nestjs/common';
import { HramsUserService } from './hrams-user.service';
import { HramsUser } from './hrams-user.entity';
import { Response } from 'src/common/api-reponse/response-type';
import { CreateHramsUserPayload } from './hrams-user.dto';

@Controller('user')
export class HramsUserController {
  constructor(private readonly hrUserService: HramsUserService) {}

  @Post()
  async createHramsUser(
    @Body() createHramsUserPayload: CreateHramsUserPayload,
  ): Promise<Response<HramsUser>> {
    const data = await this.hrUserService.createHramsUser(
      createHramsUserPayload,
    );
    return {
      statusCode: 201,
      message: 'Hrams user created successfully',
      data,
    };
  }
}
