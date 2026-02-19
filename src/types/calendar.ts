// Calendar Integration Types

export type CalendarProvider = 'google';

export interface CalendarConnection {
  id: string;
  lawyerId: string;
  provider: CalendarProvider;
  isConnected: boolean;
  email?: string;
  lastSyncedAt?: string;
}

export interface ConnectCalendarInput {
  authCode: string;
}
