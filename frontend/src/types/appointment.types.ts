import { type AppointmentStatus } from './common.types';

export interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: string;
  patient: { id: string; firstName: string; lastName: string; phone?: string };
  doctor: { id: string; user: { firstName: string; lastName: string } };
  service?: { id: string; name: string; durationMin: number; price: number };
  resource?: { id: string; name: string };
}
