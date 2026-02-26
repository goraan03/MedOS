import { apiClient } from "../lib/api-client";

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  clinic: { id: string; slug: string; name: string };
  role: string;
}

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; clinicName: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string; clinicSlug: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),
};