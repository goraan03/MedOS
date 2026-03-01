import { apiClient } from '../lib/api-client';
import type { Payment, PaymentSummary } from '../types/payment.types';

export interface CreatePaymentData {
  appointmentId?: string;
  patientId?: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  paidAt?: string;
  note?: string;
}

export const paymentsApi = {
  list: (params?: { patientId?: string; appointmentId?: string; from?: string; to?: string }) =>
    apiClient.get<Payment[]>('/payments', { params }).then(r => r.data),
  create: (data: CreatePaymentData) =>
    apiClient.post<Payment>('/payments', data).then(r => r.data),
  remove: (id: string) =>
    apiClient.delete(`/payments/${id}`),
  summary: (from: string, to: string) =>
    apiClient.get<PaymentSummary>('/payments/summary', { params: { from, to } }).then(r => r.data),
};