/**
 * Utility functions for 12-hour time formatting, parsing, and duration calculations.
 */

/**
 * Formats any time string (e.g. "09:00", "17:30", "09:00 AM", "5:30 pm")
 * into consistent 12-hour format: "hh:mm AM" or "hh:mm PM".
 */
export function formatTo12Hour(timeStr?: string | null): string {
  if (!timeStr) return '';
  const cleaned = timeStr.trim();
  // Already in 12-hour format?
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12) {
    const hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const period = match12[3].toUpperCase();
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }
  // 24-hour format:
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }
  return timeStr;
}

/**
 * Converts a time string (12-hour or 24-hour) to total minutes from midnight (0..1439).
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim();
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
  return 0;
}

/**
 * Parses any time string into 12-hour components: { hour: '01'..'12', minute: '00'..'55', period: 'AM'|'PM' }
 */
export function parseTimeTo12Hour(
  timeStr?: string | null,
  fallbackPeriod: 'AM' | 'PM' = 'AM',
  fallbackHour?: string,
): {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
} {
  const defaultHour = fallbackHour || (fallbackPeriod === 'PM' ? '05' : '09');
  if (!timeStr) {
    return { hour: defaultHour, minute: '00', period: fallbackPeriod };
  }
  const cleaned = timeStr.trim();
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    if (h < 1 || h > 12) h = 12;
    const m = match12[2];
    const p = match12[3].toUpperCase() as 'AM' | 'PM';
    return {
      hour: String(h).padStart(2, '0'),
      minute: m,
      period: p === 'PM' ? 'PM' : 'AM',
    };
  }

  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = match24[2];
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return {
      hour: String(h).padStart(2, '0'),
      minute: m,
      period: p,
    };
  }

  return { hour: defaultHour, minute: '00', period: fallbackPeriod };
}

/**
 * Rounds a 12-hour or 24-hour time string to 5-minute intervals.
 * - 'ceil': rounds up to the next 5-minute interval (for check-in)
 * - 'floor': rounds down to the previous 5-minute interval (for check-out)
 */
export function roundTimeTo5Min(
  timeStr?: string | null,
  mode: 'ceil' | 'floor' = 'floor',
): string {
  if (!timeStr) return '';
  const cleaned = timeStr.trim();
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    let hours24 = hours;
    if (period === 'PM' && hours24 < 12) hours24 += 12;
    if (period === 'AM' && hours24 === 12) hours24 = 0;
    let totalMinutes = hours24 * 60 + minutes;

    const rem = totalMinutes % 5;
    if (rem !== 0) {
      if (mode === 'ceil') {
        totalMinutes += 5 - rem;
      } else {
        totalMinutes -= rem;
      }
    }

    totalMinutes = totalMinutes % (24 * 60);
    const h24 = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const p = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
  }

  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    let totalMinutes = hours * 60 + minutes;

    const rem = totalMinutes % 5;
    if (rem !== 0) {
      if (mode === 'ceil') {
        totalMinutes += 5 - rem;
      } else {
        totalMinutes -= rem;
      }
    }

    totalMinutes = totalMinutes % (24 * 60);
    const h24 = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return timeStr;
}

/**
 * Gets current time formatted as 12-hour string (with support for ceil/floor/nearest rounding to 5 minutes)
 * - 'ceil': rounds up to next 5 minutes (always ceil for checkin)
 * - 'floor': rounds down to previous 5 minutes (always floor for checkout)
 * - 'nearest': rounds to nearest 5 minutes
 */
export function getCurrentTime12Hour(
  mode: 'ceil' | 'floor' | 'nearest' = 'nearest',
): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  let totalMinutes = hours * 60 + minutes;

  const rem = totalMinutes % 5;
  if (rem !== 0) {
    if (mode === 'ceil') {
      totalMinutes += 5 - rem;
    } else if (mode === 'floor') {
      totalMinutes -= rem;
    } else {
      totalMinutes = Math.round(totalMinutes / 5) * 5;
    }
  }

  totalMinutes = totalMinutes % (24 * 60);
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Gets the local calendar date string (YYYY-MM-DD) based on the user's local time (IST).
 * Avoids toISOString() UTC offset rollback bug.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

