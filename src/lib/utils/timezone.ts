import { parseISO } from 'date-fns';
import { format, fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * Get the user's local timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert UTC datetime to user's local timezone
 */
export function utcToLocal(utcDateString: string, timezone?: string): Date {
  try {
    const date = parseISO(utcDateString);
    const tz = timezone || getUserTimezone();
    return toZonedTime(date, tz);
  } catch (error) {
    console.error('Error converting UTC to local:', error);
    return new Date(utcDateString);
  }
}

/**
 * Convert local datetime to UTC
 */
export function localToUtc(localDate: Date, timezone?: string): Date {
  try {
    const tz = timezone || getUserTimezone();
    return fromZonedTime(localDate, tz);
  } catch (error) {
    console.error('Error converting local to UTC:', error);
    return localDate;
  }
}

/**
 * Format UTC datetime string in user's local timezone
 */
export function formatInTimezone(
  utcDateString: string,
  formatStr: string = 'PPp',
  timezone?: string
): string {
  try {
    const date = parseISO(utcDateString);
    const tz = timezone || getUserTimezone();
    return format(toZonedTime(date, tz), formatStr, { timeZone: tz });
  } catch (error) {
    console.error('Error formatting in timezone:', error);
    return utcDateString;
  }
}

/**
 * Get timezone abbreviation (e.g., PST, EST)
 */
export function getTimezoneAbbreviation(timezone?: string): string {
  try {
    const tz = timezone || getUserTimezone();
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || tz;
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error);
    return timezone || 'UTC';
  }
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone?: string): number {
  try {
    const tz = timezone || getUserTimezone();
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
}

/**
 * Convert datetime string to ISO format in UTC
 */
export function toISOString(date: Date | string): string {
  try {
    if (typeof date === 'string') {
      return parseISO(date).toISOString();
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return new Date().toISOString();
  }
}
