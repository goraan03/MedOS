import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, type CreatePaymentData } from '../../api/payments.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const schema = z.object({
  amount: z.coerce.number().positive('Must be positive'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER']),
  note: z.string().optional(),
  paidAt: z.string().optional(),
});
type FormValues = {
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  note?: string;
  paidAt?: string;
};

interface Props {
  patientId?: string;
  appointmentId?: string;
  onClose: () => void;
}

export function PaymentModal({ patientId, appointmentId, onClose }: Props) {
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { method: 'CASH' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePaymentData) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      onClose();
    },
  });

  return (
    <Modal title="New Payment" onClose={onClose}>
      <form onSubmit={handleSubmit(v => mutation.mutate({ ...v, patientId, appointmentId }))} className="space-y-4">
        <Input label="Amount *" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />

        <Select label="Method *" {...register('method')}>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="TRANSFER">Transfer</option>
        </Select>

        <Input label="Date" type="datetime-local" {...register('paidAt')} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea {...register('note')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save payment</Button>
        </div>
      </form>
    </Modal>
  );
}