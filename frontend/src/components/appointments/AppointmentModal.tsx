import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { appointmentsApi, type CreateAppointmentData } from '../../api/appointments.api';
import { patientsApi } from '../../api/patients.api';
import { servicesApi } from '../../api/services.api';
import { staffApi } from '../../api/staff.api';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const schema = z.object({
  patientId: z.string().min(1, 'Required'),
  doctorId: z.string().min(1, 'Required'),
  serviceId: z.string().optional(),
  startAt: z.string().min(1, 'Required'),
  endAt: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export function AppointmentModal({ onClose }: Props) {
  const qc = useQueryClient();

  const { data: patients } = useQuery({ queryKey: ['patients'], queryFn: () => patientsApi.list() });
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: servicesApi.list });
  const { data: staff } = useQuery({ queryKey: ['staff'], queryFn: staffApi.list });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); onClose(); },
    onError: (err: any) => alert(err.response?.data?.message ?? 'Error creating appointment'),
  });

  const doctors = staff?.filter(s => s.role === 'DOCTOR' || s.role === 'OWNER') ?? [];

  return (
    <Modal title="New Appointment" onClose={onClose}>
      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
        <Select label="Patient *" error={errors.patientId?.message} {...register('patientId')}>
          <option value="">Select patient...</option>
          {patients?.map(p => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </Select>

        <Select label="Doctor *" error={errors.doctorId?.message} {...register('doctorId')}>
          <option value="">Select doctor...</option>
          {doctors.map(s => (
            <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>
          ))}
        </Select>

        <Select label="Service" {...register('serviceId')}>
          <option value="">Select service...</option>
          {services?.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start *" type="datetime-local" error={errors.startAt?.message} {...register('startAt')} />
          <Input label="End *" type="datetime-local" error={errors.endAt?.message} {...register('endAt')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}