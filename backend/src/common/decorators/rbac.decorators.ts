import { SetMetadata } from '@nestjs/common';
import { ClinicRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: ClinicRole[]) => SetMetadata(ROLES_KEY, roles);

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);