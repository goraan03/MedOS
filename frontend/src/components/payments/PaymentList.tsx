import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';
import { type Payment, type PaymentMethod } from '../../types/payment.types';
import { Badge } from '../ui/Badge';

const METHOD_BADGE: Record<PaymentMethod, 'green' | 'blue' | 'purple'> = {
  CASH: 'green',
  CARD: 'blue',
  TRANSFER: 'purple',
};

interface Props {
  payments: Payment[];
}

export function PaymentList({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No payments yet</p>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="space-y-2 mb-4">
        {payments.map(p => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{Number(p.amount).toFixed(2)} RSD</p>
              <p className="text-xs text-gray-400 mt-0.5">{format(new Date(p.paidAt), 'dd MMM yyyy, HH:mm')}</p>
              {p.note && <p className="text-sm text-gray-500 mt-1">{p.note}</p>}
            </div>
            <Badge variant={METHOD_BADGE[p.method]}>{p.method}</Badge>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Total</span>
        <span className="font-bold text-gray-900">{total.toFixed(2)} RSD</span>
      </div>
    </div>
  );
}