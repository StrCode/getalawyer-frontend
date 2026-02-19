// Booking System Domain Types

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  clientId: string;
  lawyerId: string;
  consultationTypeId: string;
  startTime: string;      // ISO datetime
  endTime: string;        // ISO datetime
  status: BookingStatus;
  clientNotes?: string;
  lawyerNotes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  client?: {
    id: string;
    name: string;
    email: string;
  };
  lawyer?: {
    id: string;
    name: string;
    email: string;
    specialty?: string;
  };
  consultationType?: ConsultationType;
}

export interface ConsultationType {
  id: string;
  lawyerId: string;
  name: string;
  description: string;
  duration: number;        // minutes
  price: number;           // currency amount
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  lawyerId: string;
  consultationTypeId: string;
  startTime: string;
  clientNotes?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  clientNotes?: string;
  lawyerNotes?: string;
}

export interface UpdateLawyerBookingInput {
  status?: BookingStatus;
  lawyerNotes?: string;
}

export interface CreateConsultationTypeInput {
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateConsultationTypeInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}
