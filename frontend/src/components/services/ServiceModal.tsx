import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, type CreateServiceData } from '../../api/services.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  durationMin: z.coerce.number().positive('Must be positive').int(),
  price: z.coerce.number().positive('Must be positive'),
  description: z.string().optional(),
  moduleKey: z.string().optional(),
});

type FormValues = {
  name: string;
  durationMin: number;
  price: number;
  description?: string;
  moduleKey?: string;
};

interface Props {
  onClose: () => void;
}

export function ServiceModal({ onClose }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema) as any,
});

  const mutation = useMutation({
    mutationFn: (data: CreateServiceData) => servicesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); onClose(); },
  });

  return (
    <Modal title="New Service" onClose={onClose}>
      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
        <Input label="Name *" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Duration (min) *" type="number" error={errors.durationMin?.message} {...register('durationMin')} />
          <Input label="Price *" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save service</Button>
        </div>
      </form>
    </Modal>
  );
}