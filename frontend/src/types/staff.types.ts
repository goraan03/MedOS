import { type ClinicRole } from './common.types';

export interface StaffMember {
  id: string;
  role: ClinicRole;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}