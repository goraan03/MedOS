export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  note?: string;
  patient?: { id: string; firstName: string; lastName: string };
  appointment?: { id: string; startAt: string };
}

export interface PaymentSummary {
  total: number;
  count: number;
  byMethod: Record<string, number>;
}