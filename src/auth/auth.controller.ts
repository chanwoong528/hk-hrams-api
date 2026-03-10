import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';

import { AuthService, SignInDto } from './auth.service';
import { Response } from 'src/common/api-reponse/response-type';
import { AuthGuard } from './auth.guard';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<Response<{ accessToken: string; refreshToken: string }>> {
    const authTokens =
      await this.authService.signInReturnAccessToken(signInDto);
    return {
      statusCode: 200,
      message: 'Sign in successful',
      data: authTokens,
    };
  }

  @Post('new-token')
  async newToken(
    @Body() newTokenDto: { refreshToken: string },
  ): Promise<Response<{ accessToken: string; refreshToken: string }>> {
    const authTokens = await this.authService.generateNewTokensByRefreshToken(
      newTokenDto.refreshToken,
    );

    return {
      statusCode: 201,
      message: 'New tokens generated successfully',
      data: authTokens,
    };
  }

  @Get('user-info')
  @UseGuards(AuthGuard)
  async getUserInfo(@Request() request: Request): Promise<
    Response<{
      userId: string;
      email: string;
      username: string;
      departments: {
        departmentId: string;
        departmentName: string;
        isLeader: boolean;
        rank?: number;
      }[];
    }>
  > {
    const payload = request['user'] as { sub: string };
    const userInfo = await this.authService.getUserInfo(payload.sub);

    return {
      statusCode: 200,
      message: 'User info fetched successfully',
      data: userInfo,
    };
  }
}
