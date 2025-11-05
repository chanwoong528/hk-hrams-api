import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization;
    if (!token) {
      return false;
    }
    const payload = await this.authService.verifyToken(
      token.split('Bearer ')[1],
    );
    if (!payload) {
      return false;
    }
    request['user'] = payload;

    return true;
  }
}
