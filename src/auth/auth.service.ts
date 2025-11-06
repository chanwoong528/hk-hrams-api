import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { HramsUserService } from 'src/hrams-user/hrams-user.service';
import { HramsUserDepartmentService } from 'src/hrams-user-department/hrams-user-department.service';
import { comparePassword } from 'src/common/utils/hash';
// import { HramsUserDepartment } from 'src/hrams-user-department/hrams-user-department.entity';

export interface SignInDto {
  email: string;
  pw: string;
}

@Injectable()
export class AuthService {
  private readonly customException = new CustomException('Auth');
  constructor(
    private readonly jwtService: JwtService,
    private readonly hramsUserService: HramsUserService,
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
  ) {}

  async signInReturnAccessToken(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { email, pw } = signInDto;

      const user = await this.hramsUserService.getHramsUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const userDepartments =
        await this.hramsUserDepartmentService.getHramsUserDepartmentsByUserId(
          user.userId,
        );
      console.log('userDepartments>> ', userDepartments);
      const isPasswordValid = await comparePassword(pw, user.pw);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.userId,
        email: user.email,
        departments: userDepartments.map((department) => {
          return {
            departmentId: department.departmentId,
            departmentName: department.department.departmentName,
            isLeader: department.isLeader,
          };
        }),
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
        email: string;
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
    return await this.jwtService.signAsync(payload);
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
        email: decoded['email'] as string,
        departments: decoded['departments'] as {
          departmentId: string;
          departmentName: string;
          isLeader: boolean;
        }[],
      };

      const accessToken = await this.generateAccessToken(payload);
      const newRefreshToken = await this.generateRefreshToken(payload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.customException.handleException(error as UnauthorizedException);
    }
  }

  async getUserInfo(accessToken: string): Promise<{
    userId: string;
    email: string;
    departments: {
      departmentId: string;
      departmentName: string;
      isLeader: boolean;
    }[];
  }> {
    try {
      const payload = await this.verifyToken(accessToken);
      return {
        userId: payload['sub'] as string,
        email: payload['email'] as string,
        departments:
          (payload['departments'] as {
            departmentId: string;
            departmentName: string;
            isLeader: boolean;
          }[]) || [],
      };
    } catch (error) {
      this.customException.handleException(error as Error);
    }
  }
}
