// Availability Domain Types

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeRange {
  start: string;  // HH:mm format
  end: string;    // HH:mm format
}

export interface WeeklySchedule {
  [day: string]: TimeRange[];  // day: DayOfWeek
}

export interface AvailabilityException {
  id: string;
  lawyerId: string;
  startDate: string;  // ISO date (YYYY-MM-DD)
  endDate: string;    // ISO date (YYYY-MM-DD)
  reason?: string;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
}

export interface CreateExceptionInput {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
