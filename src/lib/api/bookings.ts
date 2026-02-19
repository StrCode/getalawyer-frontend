import type { Booking, CreateBookingInput, UpdateBookingInput, UpdateLawyerBookingInput } from '../../types/booking';
import type { ApiResponse } from './client';
import { httpClient } from './client';

// Client Bookings
export async function getClientBookings(): Promise<Booking[]> {
  const response = await httpClient.getAuth<ApiResponse<Booking[]>>('/api/bookings');
  return response.data || [];
}

export async function getClientBooking(id: string): Promise<Booking> {
  const response = await httpClient.getAuth<ApiResponse<Booking>>(`/api/bookings/${id}`);
  if (!response.data) {
    throw new Error('Booking not found');
  }
  return response.data;
}

export async function createBooking(data: CreateBookingInput): Promise<Booking> {
  const response = await httpClient.post<ApiResponse<Booking>>('/api/bookings', data);
  if (!response.data) {
    throw new Error('Failed to create booking');
  }
  return response.data;
}

export async function updateClientBooking(id: string, data: UpdateBookingInput): Promise<Booking> {
  const response = await httpClient.put<ApiResponse<Booking>>(`/api/bookings/${id}`, data);
  if (!response.data) {
    throw new Error('Failed to update booking');
  }
  return response.data;
}

// Lawyer Bookings
export async function getLawyerBookings(): Promise<Booking[]> {
  const response = await httpClient.getAuth<ApiResponse<Booking[]>>('/api/lawyer/bookings');
  return response.data || [];
}

export async function getLawyerBooking(id: string): Promise<Booking> {
  const response = await httpClient.getAuth<ApiResponse<Booking>>(`/api/lawyer/bookings/${id}`);
  if (!response.data) {
    throw new Error('Booking not found');
  }
  return response.data;
}

export async function updateLawyerBooking(id: string, data: UpdateLawyerBookingInput): Promise<Booking> {
  const response = await httpClient.put<ApiResponse<Booking>>(`/api/lawyer/bookings/${id}`, data);
  if (!response.data) {
    throw new Error('Failed to update booking');
  }
  return response.data;
}
