
import type { Appointment } from '@/types/appointment.types';
import { apiClient } from '../lib/api-client';
import type { AppointmentStatus } from '@/types/common.types';

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  serviceId?: string;
  resourceId?: string;
  startAt: string;
  endAt: string;
  notes?: string;
}

export const appointmentsApi = {
  list: (params?: { from?: string; to?: string; doctorId?: string }) =>
    apiClient.get<Appointment[]>('/appointments', { params }).then(r => r.data),
  get: (id: string) =>
    apiClient.get<Appointment>(`/appointments/${id}`).then(r => r.data),
  create: (data: CreateAppointmentData) =>
    apiClient.post<Appointment>('/appointments', data).then(r => r.data),
  update: (id: string, data: Partial<CreateAppointmentData> & { status?: AppointmentStatus }) =>
    apiClient.patch<Appointment>(`/appointments/${id}`, data).then(r => r.data),
  remove: (id: string) =>
    apiClient.delete(`/appointments/${id}`),
};