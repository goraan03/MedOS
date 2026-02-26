import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth.store';

interface StaffMember {
  id: string;
  role: string;
  isActive: boolean;
  user: { id: string; email: string; firstName: string; lastName: string };
}

const staffApi = {
  list: () => apiClient.get<StaffMember[]>('/clinic/staff').then((r) => r.data),
  invite: (data: unknown) => apiClient.post('/clinic/staff/invite', data).then((r) => r.data),
};

const inviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['RECEPTIONIST', 'DOCTOR', 'ASSISTANT']),
});
type InviteValues = z.infer<typeof inviteSchema>;

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  DOCTOR: 'bg-green-100 text-green-700',
  RECEPTIONIST: 'bg-yellow-100 text-yellow-700',
  ASSISTANT: 'bg-gray-100 text-gray-700',
};

function InviteForm() {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
  });
  const mutation = useMutation({
    mutationFn: staffApi.invite,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); reset(); },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <UserPlus size={18} /> Invite staff member
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input {...register('firstName')} placeholder="First name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <input {...register('lastName')} placeholder="Last name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <input {...register('email')} type="email" placeholder="Email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      <select {...register('role')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">Select role...</option>
        <option value="RECEPTIONIST">Receptionist</option>
        <option value="DOCTOR">Doctor</option>
        <option value="ASSISTANT">Assistant</option>
      </select>
      {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
      <button type="submit" disabled={mutation.isPending} className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
        {mutation.isPending ? 'Inviting...' : 'Send invite'}
      </button>
    </form>
  );
}

export function StaffPage() {
  const role = useAuthStore((s) => s.role);
  const canInvite = role === 'OWNER' || role === 'ADMIN';
  const { data: staff, isLoading } = useQuery({ queryKey: ['staff'], queryFn: staffApi.list });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Staff</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your clinic team</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="space-y-3">
              {staff?.map((member) => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{member.user.firstName} {member.user.lastName}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[member.role] ?? 'bg-gray-100'}`}>
                      {member.role}
                    </span>
                    {!member.isActive && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Invited</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {canInvite && <div><InviteForm /></div>}
      </div>
    </div>
  );
}