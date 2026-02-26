import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClinicRole } from '@prisma/client';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/rbac.decorators';
import { JwtPayload } from '../types/jwt.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ClinicRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) throw new ForbiddenException('Not authenticated');

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) throw new ForbiddenException('Insufficient role');
    }

    if (requiredPermissions?.length) {
      const hasAll = requiredPermissions.every((p) =>
        user.permissions.includes(p),
      );
      if (!hasAll) throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}