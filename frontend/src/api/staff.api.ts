import type { StaffMember } from '@/types/staff.types';
import { apiClient } from '../lib/api-client';

export const staffApi = {
  list: () =>
    apiClient.get<StaffMember[]>('/clinic/staff').then(r => r.data),
};