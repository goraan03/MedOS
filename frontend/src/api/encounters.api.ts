import { apiClient } from '../lib/api-client';
import type { Encounter } from '../types/encounter.types';

export interface CreateEncounterData {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  moduleKey: string;
  summary?: string;
  note?: string;
  visibility?: 'STAFF_ONLY' | 'PATIENT_VISIBLE';
  extraData?: Record<string, unknown>;
}

export const encountersApi = {
  list: (params?: { patientId?: string; moduleKey?: string }) =>
    apiClient.get<Encounter[]>('/encounters', { params }).then(r => r.data),
  get: (id: string) =>
    apiClient.get<Encounter>(`/encounters/${id}`).then(r => r.data),
  create: (data: CreateEncounterData) =>
    apiClient.post<Encounter>('/encounters', data).then(r => r.data),
  update: (id: string, data: Partial<CreateEncounterData>) =>
    apiClient.patch<Encounter>(`/encounters/${id}`, data).then(r => r.data),
  remove: (id: string) =>
    apiClient.delete(`/encounters/${id}`),
};