import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { fetchAthletes } from './models/athlete'
import { supabase } from './store'
import { Athlete } from './types/athlete.types'

export const useAthleteStore = (): { records: Athlete[] } => {
  const [records, setRecords] = useState<Athlete[]>([])

  const [newRecord, handleNewRecord] = useState<Athlete | null>(null)
  const [deletedRecord, handleDeletedRecord] = useState<Athlete | null>(null)

  // Load initial data and set up listeners
  useEffect(() => {
    fetchAthletes(setRecords)

    // Listen for new and deleted records
    const listener = supabase
      .channel('public:athletes')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'athletes' },
        (payload: { new: Athlete }) => handleNewRecord(payload.new)
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'athletes' },
        (payload: { new: Athlete; old: Athlete }) =>
          setRecords((prev) => [...prev.filter((p) => p.slug !== payload.old.slug), payload.new])
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'athletes' },
        (payload: { old: Athlete }) => handleDeletedRecord(payload.old)
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(listener)
    }
  }, [])

  // New record received from Postgres
  useEffect(() => {
    if (newRecord) setRecords(records.concat(newRecord))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRecord])

  // Deleted record received from postgres
  useEffect(() => {
    if (deletedRecord) setRecords(records.filter((item) => item.slug !== deletedRecord.slug))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedRecord])

  return {
    records,
  }
}
