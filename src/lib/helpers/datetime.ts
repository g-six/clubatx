export function getFormattedTime(event_date: string, event_time: string) {
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
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(dt)
  } catch (e: any) {
    alert([event_date, event_time, e.message].join(' - '))
  }

  return [event_date, event_time].join(' ')
}
