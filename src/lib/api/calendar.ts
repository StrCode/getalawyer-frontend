import type { CalendarConnection, ConnectCalendarInput } from '../../types/calendar';
import type { ApiResponse } from './client';
import { httpClient } from './client';

export async function getCalendarConnection(): Promise<CalendarConnection | null> {
  const response = await httpClient.getAuth<ApiResponse<CalendarConnection>>('/api/lawyer/calendar');
  return response.data || null;
}

export async function connectCalendar(data: ConnectCalendarInput): Promise<CalendarConnection> {
  const response = await httpClient.post<ApiResponse<CalendarConnection>>('/api/lawyer/calendar', data);
  if (!response.data) {
    throw new Error('Failed to connect calendar');
  }
  return response.data;
}

export async function disconnectCalendar(): Promise<void> {
  await httpClient.delete<ApiResponse>('/api/lawyer/calendar');
}
