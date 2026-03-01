import { apiClient } from '../lib/api-client';

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  clinic: { id: string; slug: string; name: string; isPolyclinic: boolean };
  role: string;
  modules: string[];
  allowedModules: string[];
}

export const authApi = {
  register: (data: {
    clinic: { name: string; pib?: string; isPolyclinic?: boolean; modules?: string[] };
    owner: { firstName: string; lastName: string };
    email: string;
    password: string;
  }) => apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string; clinicSlug: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then(r => r.data),
};