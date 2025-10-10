import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('AdminGuard: No token found in request');
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log('AdminGuard: Token payload:', payload);
      // Check role directly from token payload like Express
      if (payload.role !== 'admin') {
        console.log(`AdminGuard: User role is not admin: ${payload.role}`);
        return false;
      }
      return true;
    } catch (error) {
      console.log('AdminGuard: Token verification failed:', error.message);
      return false;
    }
  }
}
