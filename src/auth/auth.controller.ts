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

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호를 사용하여 Access Token 및 Refresh Token을 발급받습니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 토큰 반환' })
  @ApiResponse({ status: 401, description: '유효하지 않은 자격 증명' })
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

  @ApiOperation({ summary: '토큰 갱신', description: 'Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급받습니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGci...' },
      },
    },
  })
  @ApiResponse({ status: 201, description: '새 토큰 발급 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
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

  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인한 사용자의 정보를 조회합니다.' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: '내 정보 반환 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
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
