/**
 * Returns a formatted date and time string for a given event date and time.
 *
 * @param event_date - The event date in string format (e.g., '2024-06-01').
 * @param event_time - The event time in string format (e.g., '18:30').
 * @param separator - separate date and time with a separator of your choice.
 * @returns The formatted date and time string in 'en-US' locale, or a fallback string if formatting fails.
 */
export function getFormattedTime(event_date: string, event_time: string, separator?: string) {
  try {
    const dt = getLocalDateFromDateAndTime(event_date, event_time)
    if (typeof dt === 'string') return dt
    if (separator) {
      return [
        new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(dt),
        new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(dt),
      ].join(separator)
    }
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(dt)
  } catch (e: any) {
    console.log([event_date, event_time, e.message].join(' - '))
  }

  return [event_date, event_time].join(' ')
}

/**
 * Returns a local Date object constructed from a date string and a time string.
 *
 * @param event_date - The date string in the format 'YYYY-MM-DD'.
 * @param event_time - The time string in the format 'HH:mm'.
 * @returns A Date object representing the local date and time, or a string combining the input values if parsing fails.
 *
 * @remarks
 * This function parses the provided date and time strings, constructs a Date object in the local timezone,
 * and sets its year, month, day, hour, and minute accordingly. If parsing fails, it logs the error and returns
 * a string with the original input values.
 *
 * @example
 * ```typescript
 * const date = getLocalDateFromDateAndTime('2024-06-01', '14:30');
 * // date is a Date object representing June 1, 2024, 14:30 local time
 * ```
 */
export function getLocalDateFromDateAndTime(event_date: string, event_time: string) {
  try {
    const ymd = event_date
      .split('-')
      .map(Number)
      .filter((n) => !isNaN(n))
    ymd[1] -= 1
    const hm = event_time
      .split(':')
      .map(Number)
      .filter((n) => !isNaN(n))

    const dt = new Date()
    dt.setDate(ymd.pop()!)
    dt.setMonth(ymd.pop()!)
    dt.setFullYear(ymd.pop()!)
    dt.setHours(hm[0])
    dt.setMinutes(hm[1])
    return dt
  } catch (e: any) {
    console.log([event_date, event_time, e.message].join(' - '))
  }
  return [event_date, event_time].join(' ')
}
