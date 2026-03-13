import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { HramsUserService } from 'src/hrams-user/hrams-user.service';
import { HramsUserDepartmentService } from 'src/hrams-user-department/hrams-user-department.service';
import { comparePassword } from 'src/common/utils/hash';
// import { HramsUserDepartment } from 'src/hrams-user-department/hrams-user-department.entity';

import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ description: '사용자 이메일', example: 'user@hankookilbo.com' })
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'password123!' })
  pw: string;
}

@Injectable()
export class AuthService {
  private readonly customException = new CustomException('Auth');
  constructor(
    private readonly jwtService: JwtService,
    private readonly hramsUserService: HramsUserService,
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
  ) { }

  async signInReturnAccessToken(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { email, pw } = signInDto;

      const user = await this.hramsUserService.getHramsUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isPasswordValid = await comparePassword(pw, user.pw);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.userId,
      };

      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);

      return { accessToken, refreshToken };
    } catch (error: unknown) {
      this.customException.handleException(error as Error);
    }
  }

  async verifyToken(token: string): Promise<Record<string, unknown>> {
    try {
      const decoded: string | null | Record<string, unknown> =
        this.jwtService.decode(token);

      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(token);

      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      return payload;
    } catch (error) {
      this.customException.handleException(error as Error);
    }
  }

  private async generateAccessToken(
    payload: Record<string, unknown>,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(
    payload: Record<string, unknown>,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async generateNewTokensByRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded: string | null | Record<string, unknown> =
        this.jwtService.decode(refreshToken);

      if (!decoded) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = {
        sub: decoded['sub'] as string,
      };

      const accessToken = await this.generateAccessToken(payload);
      const newRefreshToken = await this.generateRefreshToken(payload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.customException.handleException(error as UnauthorizedException);
    }
  }

  async getUserInfo(userId: string): Promise<{
    userId: string;
    email: string;
    username: string;
    departments: {
      departmentId: string;
      departmentName: string;
      isLeader: boolean;
      rank?: number;
    }[];
  }> {
    try {
      const user = await this.hramsUserService.getHramsUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        userId: user.userId,
        email: user.email,
        username: user.koreanName,
        departments: (user.hramsUserDepartments || []).map((department) => ({
          departmentId: department.departmentId,
          departmentName: department.department.departmentName,
          isLeader: department.isLeader,
          ...(department.isLeader ? { rank: department.department.rank } : {}),
        })),
      };
    } catch (error) {
      this.customException.handleException(error as Error);
    }
  }
}
