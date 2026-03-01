import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { encountersApi, type CreateEncounterData } from '../../api/encounters.api';
import { staffApi } from '../../api/staff.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const schema = z.object({
  patientId: z.string().min(1, 'Required'),
  doctorId: z.string().min(1, 'Required'),
  moduleKey: z.string().min(1, 'Required'),
  summary: z.string().optional(),
  note: z.string().optional(),
  visibility: z.enum(['STAFF_ONLY', 'PATIENT_VISIBLE']).optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  patientId: string;
  onClose: () => void;
}

export function EncounterModal({ patientId, onClose }: Props) {
  const qc = useQueryClient();
  const { data: staff } = useQuery({ queryKey: ['staff'], queryFn: staffApi.list });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId, moduleKey: 'general', visibility: 'STAFF_ONLY' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateEncounterData) => encountersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['encounters'] });
      onClose();
    },
  });

  const doctors = staff?.filter(s => s.role === 'DOCTOR' || s.role === 'OWNER') ?? [];

  return (
    <Modal title="New Encounter" onClose={onClose}>
      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
        <input type="hidden" {...register('patientId')} />

        <Select label="Doctor *" error={errors.doctorId?.message} {...register('doctorId')}>
          <option value="">Select doctor...</option>
          {doctors.map(s => (
            <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>
          ))}
        </Select>

        <Select label="Module *" error={errors.moduleKey?.message} {...register('moduleKey')}>
          <option value="general">General</option>
          <option value="dental">Dental</option>
        </Select>

        <Input label="Summary" {...register('summary')} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea {...register('note')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <Select label="Visibility" {...register('visibility')}>
          <option value="STAFF_ONLY">Staff only</option>
          <option value="PATIENT_VISIBLE">Patient visible</option>
        </Select>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}