import type { Patient } from '@/types/patient.types';
import { apiClient } from '../lib/api-client';

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string;
  notes?: string;
}

export const patientsApi = {
  list: (search?: string) =>
    apiClient.get<Patient[]>('/patients', { params: { search } }).then(r => r.data),
  get: (id: string) =>
    apiClient.get<Patient>(`/patients/${id}`).then(r => r.data),
  create: (data: CreatePatientData) =>
    apiClient.post<Patient>('/patients', data).then(r => r.data),
  update: (id: string, data: Partial<CreatePatientData>) =>
    apiClient.patch<Patient>(`/patients/${id}`, data).then(r => r.data),
  remove: (id: string) =>
    apiClient.delete(`/patients/${id}`),
};