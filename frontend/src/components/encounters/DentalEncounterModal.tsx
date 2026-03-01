import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { encountersApi, type CreateEncounterData } from '../../api/encounters.api';
import { staffApi } from '../../api/staff.api';
import { servicesApi } from '../../api/services.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const schema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1, 'Required'),
  tooth: z.string().min(1, 'Required'),
  serviceId: z.string().min(1, 'Required'),
  material: z.string().optional(),
  anesthesia: z.boolean().optional(),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  patientId: string;
  onClose: () => void;
}

export function DentalEncounterModal({ patientId, onClose }: Props) {
  const qc = useQueryClient();

  const { data: staff } = useQuery({ queryKey: ['staff'], queryFn: staffApi.list });
  const { data: dentalServices = [] } = useQuery({
    queryKey: ['services', 'dental'],
    queryFn: () => servicesApi.listByModule('dental'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const service = dentalServices.find(s => s.id === values.serviceId);
      const data: CreateEncounterData = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        moduleKey: 'dental',
        summary: `${values.tooth} – ${service?.name ?? ''}`,
        note: values.note,
        extraData: {
          tooth: values.tooth,
          serviceId: values.serviceId,
          serviceName: service?.name,
          material: values.material,
          anesthesia: values.anesthesia ?? false,
        },
      };
      return encountersApi.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['encounters'] }); onClose(); },
  });

  const doctors = staff?.filter(s => s.role === 'DOCTOR' || s.role === 'OWNER') ?? [];

  return (
    <Modal title="New Dental Encounter" onClose={onClose}>
      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
        <input type="hidden" {...register('patientId')} />

        <Select label="Doctor *" error={errors.doctorId?.message} {...register('doctorId')}>
          <option value="">Select doctor...</option>
          {doctors.map(s => (
            <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input label='Tooth *' placeholder='e.g. "26"' error={errors.tooth?.message} {...register('tooth')} />

          <Select label="Procedure (Service) *" error={errors.serviceId?.message} {...register('serviceId')}>
            <option value="">Select service...</option>
            {dentalServices.length === 0 ? (
              <option disabled>No dental services — add them first</option>
            ) : (
              dentalServices.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))
            )}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Material" placeholder="e.g. Composite" {...register('material')} />
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="anesthesia" {...register('anesthesia')} className="rounded" />
            <label htmlFor="anesthesia" className="text-sm text-gray-700">Anesthesia used</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea {...register('note')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}