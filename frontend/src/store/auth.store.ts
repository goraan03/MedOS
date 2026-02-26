import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ClinicRole = 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'ASSISTANT';

interface AuthUser {
  id: string; email: string; firstName: string; lastName: string;
}
interface AuthClinic {
  id: string; slug: string; name: string;
}
interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  clinic: AuthClinic | null;
  role: ClinicRole | null;
  permissions: string[];
  setAuth: (data: { accessToken: string; user: AuthUser; clinic: AuthClinic; role: ClinicRole }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: ClinicRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      clinic: null,
      role: null,
      permissions: [],
      setAuth: ({ accessToken, user, clinic, role }) =>
        set({ accessToken, user, clinic, role }),
      logout: () =>
        set({ accessToken: null, user: null, clinic: null, role: null, permissions: [] }),
      hasPermission: (permission) => get().permissions.includes(permission),
      hasRole: (...roles) => roles.includes(get().role as ClinicRole),
    }),
    { name: 'medos-auth' },
  ),
);