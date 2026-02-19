import { addDays, endOfDay, format, isAfter, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, formatStr: string = 'PPP'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a time string to a readable format
 */
export function formatTime(dateString: string, formatStr: string = 'p'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateString;
  }
}

/**
 * Format a datetime string to a readable format
 */
export function formatDateTime(dateString: string, formatStr: string = 'PPp'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return isBefore(date, new Date());
  } catch (error) {
    console.error('Error checking past date:', error);
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return isAfter(date, new Date());
  } catch (error) {
    console.error('Error checking future date:', error);
    return false;
  }
}

/**
 * Check if two dates are the same
 */
export function isSameDate(date1: string, date2: string): boolean {
  try {
    const d1 = parseISO(date1);
    const d2 = parseISO(date2);
    return isEqual(d1, d2);
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
}

/**
 * Get date range for a given number of days from today
 */
export function getDateRange(days: number): { startDate: string; endDate: string } {
  const start = startOfDay(new Date());
  const end = endOfDay(addDays(start, days));
  
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

/**
 * Convert ISO date to YYYY-MM-DD format
 */
export function toDateString(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting to date string:', error);
    return dateString;
  }
}

/**
 * Convert HH:mm time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:mm time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if time1 is before time2 (HH:mm format)
 */
export function isTimeBefore(time1: string, time2: string): boolean {
  return timeToMinutes(time1) < timeToMinutes(time2);
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get current time in HH:mm format
 */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm');
}
