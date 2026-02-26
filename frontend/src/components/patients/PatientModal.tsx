import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, type CreatePatientData } from '../../api/patients.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export function PatientModal({ onClose }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePatientData) => patientsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); onClose(); },
  });

  return (
    <Modal title="New Patient" onClose={onClose}>
      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name *" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name *" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date of birth" type="date" {...register('dateOfBirth')} />
          <Select label="Gender" {...register('gender')}>
            <option value="">-</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </div>
        <Input label="Allergies" {...register('allergies')} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save patient</Button>
        </div>
      </form>
    </Modal>
  );
}