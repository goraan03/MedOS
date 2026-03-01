import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type ClinicRole } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  clinicSlug: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
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
    onError: () => setError('root', { message: 'Invalid credentials or clinic slug' }),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">MedOS</h1>
          <p className="text-gray-500 mt-1">Sign in to your clinic</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic slug</label>
              <input {...register('clinicSlug')} placeholder="my-clinic" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.clinicSlug && <p className="text-red-500 text-xs mt-1">{errors.clinicSlug.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input {...register('password')} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
            <button type="submit" disabled={mutation.isPending} className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New clinic? <Link to="/register" className="text-primary-600 hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}