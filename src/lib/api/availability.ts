import type { AvailabilityException, AvailableSlot, CreateExceptionInput, WeeklySchedule } from '../../types/availability';
import type { ApiResponse } from './client';
import { httpClient } from './client';

// Availability Schedule
export async function getAvailabilitySchedule(): Promise<WeeklySchedule> {
  const response = await httpClient.getAuth<ApiResponse<WeeklySchedule>>('/api/lawyer/availability/schedule');
  return response.data || {};
}

export async function updateAvailabilitySchedule(schedule: WeeklySchedule): Promise<WeeklySchedule> {
  const response = await httpClient.post<ApiResponse<WeeklySchedule>>('/api/lawyer/availability/schedule', schedule);
  if (!response.data) {
    throw new Error('Failed to update availability schedule');
  }
  return response.data;
}

// Availability Exceptions
export async function getAvailabilityExceptions(): Promise<AvailabilityException[]> {
  const response = await httpClient.getAuth<ApiResponse<AvailabilityException[]>>('/api/lawyer/availability/exceptions');
  return response.data || [];
}

export async function createAvailabilityException(data: CreateExceptionInput): Promise<AvailabilityException> {
  const response = await httpClient.post<ApiResponse<AvailabilityException>>('/api/lawyer/availability/exceptions', data);
  if (!response.data) {
    throw new Error('Failed to create availability exception');
  }
  return response.data;
}

export async function deleteAvailabilityException(id: string): Promise<void> {
  await httpClient.delete<ApiResponse>(`/api/lawyer/availability/exceptions/${id}`);
}

// Available Slots
export async function getAvailableSlots(
  lawyerId: string,
  consultationTypeId: string,
  startDate: string,
  endDate: string
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({
    consultationTypeId,
    startDate,
    endDate
  });
  const response = await httpClient.get<ApiResponse<AvailableSlot[]>>(
    `/api/lawyers/${lawyerId}/available-slots?${params.toString()}`
  );
  return response.data || [];
}
