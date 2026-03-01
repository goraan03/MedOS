import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';

const AVAILABLE_MODULES = [
  { key: 'dental', label: 'Dental', description: 'Stomatološka ordinacija' },
  { key: 'physio', label: 'Physio', description: 'Fizikalna terapija' },
  { key: 'ophthalmology', label: 'Ophthalmology', description: 'Oftalmologija' },
  { key: 'dermatology', label: 'Dermatology', description: 'Dermatologija' },
];

interface ClinicModule {
  id: string;
  moduleKey: string;
  enabled: boolean;
  enabledAt: string;
}

export function ClinicSettingsPage() {
  const qc = useQueryClient();
  const { clinic, modules: storeModules, setAuth, user, role, allowedModules } = useAuthStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const { data: dbModules = [] } = useQuery<ClinicModule[]>({
    queryKey: ['clinic-modules'],
    queryFn: () => apiClient.get('/clinic/modules').then(r => r.data),
    onSuccess: (data: ClinicModule[]) => {
      if (!initialized) {
        setSelected(data.filter(m => m.enabled).map(m => m.moduleKey).filter(m => m !== 'general'));
        setInitialized(true);
      }
    },
  } as any);

  const mutation = useMutation({
    mutationFn: (modules: string[]) =>
      apiClient.patch('/clinic/modules', { modules }).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['clinic-modules'] });
      if (data.warnings) setWarning(data.warnings);
      // Ažuriraj store
      const newModules = data.modules.filter((m: ClinicModule) => m.enabled).map((m: ClinicModule) => m.moduleKey);
      setAuth({
        accessToken: useAuthStore.getState().accessToken!,
        user: user!,
        clinic: clinic!,
        role: role!,
        modules: newModules,
        allowedModules,
      });
    },
  });

  const toggleModule = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key],
    );
  };

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Clinic Settings" subtitle="Manage your clinic modules and information" />

      {/* Modules */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-1">Modules</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enable or disable modules for your clinic. Existing data is preserved when disabling.
        </p>

        {warning && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            {warning}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {/* General — uvek aktivan */}
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">General</p>
              <p className="text-xs text-gray-400">Core modul, uvek aktivan</p>
            </div>
            <Badge variant="green">Active</Badge>
          </div>

          {AVAILABLE_MODULES.map(mod => {
            const isSelected = selected.includes(mod.key);
            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => toggleModule(mod.key)}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{mod.label}</p>
                  <p className="text-xs text-gray-400">{mod.description}</p>
                </div>
                {isSelected && <Badge variant="green">Active</Badge>}
              </button>
            );
          })}
        </div>

        <Button onClick={() => mutation.mutate(['general', ...selected])} loading={mutation.isPending}>
          Save modules
        </Button>
      </div>

      {/* Clinic info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Clinic info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{clinic?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Slug</span>
            <span className="font-mono text-gray-700">{clinic?.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="text-gray-700">{clinic?.isPolyclinic ? 'Poliklinika' : 'Ordinacija'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}