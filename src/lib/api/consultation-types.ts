import type { ConsultationType, CreateConsultationTypeInput, UpdateConsultationTypeInput } from '../../types/booking';
import type { ApiResponse } from './client';
import { httpClient } from './client';

export async function getConsultationTypes(): Promise<ConsultationType[]> {
  const response = await httpClient.getAuth<ApiResponse<ConsultationType[]>>('/api/consultation-types');
  return response.data || [];
}

export async function getConsultationType(id: string): Promise<ConsultationType> {
  const response = await httpClient.getAuth<ApiResponse<ConsultationType>>(`/api/consultation-types/${id}`);
  if (!response.data) {
    throw new Error('Consultation type not found');
  }
  return response.data;
}

export async function createConsultationType(data: CreateConsultationTypeInput): Promise<ConsultationType> {
  const response = await httpClient.post<ApiResponse<ConsultationType>>('/api/consultation-types', data);
  if (!response.data) {
    throw new Error('Failed to create consultation type');
  }
  return response.data;
}

export async function updateConsultationType(id: string, data: UpdateConsultationTypeInput): Promise<ConsultationType> {
  const response = await httpClient.put<ApiResponse<ConsultationType>>(`/api/consultation-types/${id}`, data);
  if (!response.data) {
    throw new Error('Failed to update consultation type');
  }
  return response.data;
}

export async function deleteConsultationType(id: string): Promise<void> {
  await httpClient.delete<ApiResponse>(`/api/consultation-types/${id}`);
}
