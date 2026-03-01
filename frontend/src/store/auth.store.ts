import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ClinicRole = 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'ASSISTANT';

interface AuthUser {
  id: string; email: string; firstName: string; lastName: string;
}
interface AuthClinic {
  id: string; slug: string; name: string; isPolyclinic: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  clinic: AuthClinic | null;
  role: ClinicRole | null;
  permissions: string[];
  modules: string[];         // moduli klinike
  allowedModules: string[];  // moduli koje ovaj korisnik sme da koristi

  setAuth: (data: {
    accessToken: string;
    user: AuthUser;
    clinic: AuthClinic;
    role: ClinicRole;
    modules: string[];
    allowedModules: string[];
  }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: ClinicRole[]) => boolean;
  hasModule: (module: string) => boolean;
  canUseModule: (module: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      clinic: null,
      role: null,
      permissions: [],
      modules: [],
      allowedModules: [],

      setAuth: ({ accessToken, user, clinic, role, modules, allowedModules }) =>
        set({ accessToken, user, clinic, role, modules, allowedModules }),

      logout: () =>
        set({
          accessToken: null, user: null, clinic: null,
          role: null, permissions: [], modules: [], allowedModules: [],
        }),

      hasPermission: (permission) => get().permissions.includes(permission),
      hasRole: (...roles) => roles.includes(get().role as ClinicRole),

      // klinika ima ovaj modul
      hasModule: (module) => get().modules.includes(module),

      // ovaj korisnik sme da koristi ovaj modul
      canUseModule: (module) => {
        const { role, allowedModules, modules } = get();
        if (role === 'OWNER' || role === 'ADMIN') return modules.includes(module);
        return allowedModules.includes(module);
      },
    }),
    { name: 'medos-auth' },
  ),
);