import { CalendarEvent } from '@/lib/models/event/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export const useTeamEvents = (): {
  records: CalendarEvent[]
  setRecords: Dispatch<SetStateAction<CalendarEvent[]>>
} => {
  const [records, setRecords] = useState<CalendarEvent[]>([])
  const [newRecord, handleNewRecord] = useState<CalendarEvent | null>(null)
  const [deletedRecord, handleDeletedRecord] = useState<CalendarEvent | null>(null)

  // Load initial data and set up listeners
  // useEffect(() => {
  //   // Listen for new and deleted teams
  //   const listener = supabase
  //     .channel('public:events')
  //     .on(
  //       REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
  //       { event: 'INSERT', schema: 'public', table: 'events' },
  //       (payload: { new: CalendarEvent }) => handleNewRecord(payload.new)
  //     )
  //     .on(
  //       REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
  //       { event: 'UPDATE', schema: 'public', table: 'events' },
  //       (payload: { new: CalendarEvent; old: CalendarEvent }) =>
  //         setRecords((prev) => [...prev.filter((p) => p.slug !== payload.old.slug), payload.new])
  //     )
  //     .on(
  //       REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
  //       { event: 'DELETE', schema: 'public', table: 'events' },
  //       (payload: { old: CalendarEvent }) => handleDeletedRecord(payload.old)
  //     )
  //     .on(
  //       REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
  //       { event: 'DELETE', schema: 'public', table: 'invitees' },
  //       (payload: { new: CalendarEvent }) => {
  //         new Audio('/sounds/new-message.mp3').play()
  //         handleNewRecord(payload.new)
  //       }
  //     )
  //     .subscribe()

  //   // Cleanup on unmount
  //   return () => {
  //     supabase.removeChannel(listener)
  //   }
  // }, [])

  // New team received from Postgres
  useEffect(() => {
    if (newRecord) setRecords(records.concat(newRecord))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRecord])

  // Deleted team received from postgres
  useEffect(() => {
    if (deletedRecord) setRecords(records.filter((item) => item.name !== deletedRecord.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedRecord])

  return {
    records,
    setRecords,
  }
}

export function getDaysHoursMinutesBeforeKickoff(date: Date) {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0 }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  let best =
    days > 1
      ? `${days} days`
      : days === 1
        ? hours <= 6
          ? 'Tomorrow'
          : new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date)
        : hours > 16
          ? 'Tomorrow'
          : hours > 1
            ? `${hours} hours`
            : `${minutes} minutes`
  return { days, hours, minutes, best }
}

export function getDaysHoursMinutesAfterKickoff(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0 }

  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
  const months =
    weeks >= 4 && now.getFullYear() + now.getMonth() !== date.getFullYear() + date.getMonth()
      ? now.getFullYear() + now.getMonth() - (date.getFullYear() + date.getMonth())
      : 0
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  let best =
    months > 1
      ? `${months} months ago`
      : months === 1
        ? `a month ago`
        : weeks > 1
          ? `${weeks} weeks ago`
          : days > 1
            ? `${days} days`
            : days === 1
              ? hours <= 6
                ? 'Yesterday'
                : new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date)
              : hours > 16
                ? 'Yesterday'
                : hours > 1
                  ? `${hours} hours`
                  : `${minutes} minutes`
  return { days, hours, minutes, best }
}
