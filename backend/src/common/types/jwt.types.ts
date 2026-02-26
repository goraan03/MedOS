import { ClinicRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  clinicId: string;
  role: ClinicRole;
  permissions: string[];
  specialties: string[];
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}