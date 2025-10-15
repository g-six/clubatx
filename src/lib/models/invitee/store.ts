import { supabase } from '@/lib/store'
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { fetchInvitees } from '.'
import { Invitee } from './types'

export const useInvitees = (): { records: Invitee[]; deletedRecord: Invitee | null } => {
  const [records, setRecords] = useState<Invitee[]>([])
  const [newRecord, handleNewRecord] = useState<Invitee | null>(null)
  const [deletedRecord, handleDeletedRecord] = useState<Invitee | null>(null)

  // Load initial data and set up listeners
  useEffect(() => {
    fetchInvitees(setRecords)

    // Listen for new and deleted teams
    const listener = supabase
      .channel('public:invitees')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'invitees' },
        (payload: { new: Invitee }) => handleNewRecord(payload.new)
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'invitees' },
        (payload: { new: Invitee; old: Invitee }) =>
          setRecords((prev) => [
            ...prev.filter((p) => p.athlete !== payload.old.athlete && p.event !== payload.old.event),
            payload.new,
          ])
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'invitees' },
        (payload: { old: Invitee }) => {
          handleDeletedRecord(payload.old)
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(listener)
    }
  }, [])

  // New team received from Postgres
  useEffect(() => {
    if (newRecord) setRecords(records.concat(newRecord))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRecord])

  // Deleted team received from postgres
  useEffect(() => {
    if (deletedRecord)
      setRecords(records.filter((item) => item.athlete !== deletedRecord.athlete && item.event !== deletedRecord.event))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedRecord])

  return {
    records,
    deletedRecord,
  }
}
