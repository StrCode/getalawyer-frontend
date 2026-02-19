import type { LawyerListItem, LawyerProfile } from '../../types/lawyer-profile';
import type { ApiResponse } from './client';
import { httpClient } from './client';

export async function getLawyers(): Promise<LawyerListItem[]> {
  const response = await httpClient.get<ApiResponse<LawyerListItem[]>>('/api/lawyers');
  return response.data || [];
}

export async function getLawyer(id: string): Promise<LawyerProfile> {
  const response = await httpClient.get<ApiResponse<LawyerProfile>>(`/api/lawyers/${id}`);
  if (!response.data) {
    throw new Error('Lawyer not found');
  }
  return response.data;
}

export async function getPublicLawyerProfile(id: string): Promise<LawyerProfile> {
  const response = await httpClient.get<ApiResponse<LawyerProfile>>(`/api/public/lawyers/${id}`);
  if (!response.data) {
    throw new Error('Lawyer profile not found');
  }
  return response.data;
}
