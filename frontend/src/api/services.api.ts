import { apiClient } from '../lib/api-client';
import { type Service } from '../types/service.types';

export interface CreateServiceData {
  name: string;
  durationMin: number;
  price: number;
  description?: string;
  moduleKey?: string;
}

export const servicesApi = {
  list: () =>
    apiClient.get<Service[]>('/services').then(r => r.data),
  listByModule: (moduleKey: string) =>
    apiClient.get<Service[]>('/services', { params: { moduleKey } }).then(r => r.data),
  create: (data: CreateServiceData) =>
    apiClient.post<Service>('/services', data).then(r => r.data),
  update: (id: string, data: Partial<CreateServiceData>) =>
    apiClient.patch<Service>(`/services/${id}`, data).then(r => r.data),
  remove: (id: string) =>
    apiClient.delete(`/services/${id}`),
};