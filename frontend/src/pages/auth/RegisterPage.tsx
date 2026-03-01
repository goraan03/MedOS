import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import type { ClinicRole } from '@/types/common.types';

const AVAILABLE_MODULES = [
  { key: 'dental', label: 'Dental', description: 'Stomatološka ordinacija' },
  { key: 'physio', label: 'Physio', description: 'Fizikalna terapija' },
  { key: 'ophthalmology', label: 'Ophthalmology', description: 'Oftalmologija' },
  { key: 'dermatology', label: 'Dermatology', description: 'Dermatologija' },
];

const schema = z.object({
  clinicName: z.string().min(2, 'Min 2 karaktera'),
  pib: z.string().optional(),
  isPolyclinic: z.boolean().optional(),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 karaktera'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isPolyclinic, setIsPolyclinic] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isPolyclinic: false },
  });

  const toggleModule = (key: string) => {
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key],
    );
  };

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        user: data.user,
        clinic: data.clinic,
        role: data.role as ClinicRole,
        modules: data.modules,
        allowedModules: data.allowedModules,
      });
      navigate('/dashboard');
    },
    onError: (err: any) =>
      setError('root', { message: err.response?.data?.message ?? 'Registration failed' }),
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      clinic: {
        name: values.clinicName,
        pib: values.pib || undefined,
        isPolyclinic,
        modules: selectedModules,
      },
      owner: {
        firstName: values.firstName,
        lastName: values.lastName,
      },
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">MedOS</h1>
          <p className="text-gray-500 mt-1">Registrujte vašu kliniku</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Podaci o klinici */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Podaci o klinici
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naziv klinike *</label>
                  <input {...register('clinicName')} placeholder="Smile Dental" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.clinicName && <p className="text-red-500 text-xs mt-1">{errors.clinicName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIB <span className="text-gray-400 font-normal">(opciono)</span>
                  </label>
                  <input {...register('pib')} placeholder="123456789" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Podaci o vlasniku */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Podaci o vlasniku
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ime *</label>
                  <input {...register('firstName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prezime *</label>
                  <input {...register('lastName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka *</label>
                  <input {...register('password')} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* Tip klinike */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Tip klinike
              </h3>
              <button
                type="button"
                onClick={() => setIsPolyclinic(p => !p)}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors mb-3 ${
                  isPolyclinic ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  isPolyclinic ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}>
                  {isPolyclinic && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Poliklinika</p>
                  <p className="text-xs text-gray-400">Klinika sa više grana medicine</p>
                </div>
              </button>

              {/* Moduli */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moduli / grane medicine
                </label>
                <div className="space-y-2">
                  {/* General — uvek aktivan */}
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">General</p>
                      <p className="text-xs text-gray-400">Core modul, uvek aktivan</p>
                    </div>
                  </div>

                  {AVAILABLE_MODULES.map(mod => (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() => toggleModule(mod.key)}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                        selectedModules.includes(mod.key)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        selectedModules.includes(mod.key) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedModules.includes(mod.key) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{mod.label}</p>
                        <p className="text-xs text-gray-400">{mod.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errors.root && (
              <p className="text-red-500 text-sm">{errors.root.message}</p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Kreiranje...' : 'Kreiraj kliniku'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Već imate nalog?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Prijavite se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}