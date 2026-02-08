import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';
import { UserRole } from '../constants/roles.constant';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<UserRole>(
      ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If route is not marked admin-only, allow access
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user =
      request.user ??
      this.resolveUserFromAuthorizationHeader(
        request.headers?.authorization,
      );

    if (user && !request.user) {
      request.user = user;
    }

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }

  private resolveUserFromAuthorizationHeader(
    authorizationHeader?: string,
  ) {
    if (!authorizationHeader) {
      return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    const jwtSecret = this.configService.get<string>(
      'auth.jwtSecret',
    );

    if (!jwtSecret) {
      return null;
    }

    try {
      const payload = this.jwtService.verify(
        token,
        {
          secret: jwtSecret,
        },
      ) as {
        [key: string]: unknown;
        sub?: string;
        email?: string;
        role?: string;
      };

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }
}
