import { supabase } from '@/lib/store'
import UserContext from '@/lib/user-context'
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import { useContext, useEffect, useState } from 'react'
import { fetchTeams } from '.'
import { Team, TeamMember } from './types'

export const useTeams = (): { records: Team[] } => {
  const ctx = useContext(UserContext)
  const [records, setRecords] = useState<Team[]>([])
  const [newRecord, handleNewTeam] = useState<Team | null>(null)
  const [deletedRecord, handleDeletedRecord] = useState<Team | null>(null)

  // Load initial data and set up listeners
  useEffect(() => {
    if (ctx.user) fetchTeams(ctx.user.id, setRecords)

    // Listen for new and deleted teams
    const listener = supabase
      .channel('public:teams')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'teams' },
        (payload: { new: Team }) => handleNewTeam(payload.new)
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'teams' },
        (payload: { new: Team; old: Team }) =>
          setRecords((prev) => [...prev.filter((p) => p.name !== payload.old.name), payload.new])
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'teams' },
        (payload: { old: Team }) => handleDeletedRecord(payload.old)
      )
      .subscribe()

    // Listen for new and deleted team members
    const membersListener = supabase
      .channel('public:teams')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'team_members' },
        (payload: { new: TeamMember }) => {
          if (records.length) {
            const updated = [...records]
            for (let i = 0; i < updated.length; i++) {
              if (updated[i].name === payload.new.team) {
                updated[i].members = [...(updated[i].members || []), payload.new]
              }
            }
            setRecords(updated)
          }
        }
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'team_members' },
        (payload: { new: TeamMember; old: TeamMember }) => {
          if (records.length) {
            const updated = [...records]
            for (let i = 0; i < updated.length; i++) {
              if (updated[i].name === payload.old.team) {
                updated[i].members = updated[i].members?.filter((m) => m.slug !== payload.old.slug) || []
              }
            }
            for (let i = 0; i < updated.length; i++) {
              if (updated[i].name === payload.new.team) {
                updated[i].members = [
                  ...(updated[i].members?.filter((m) => m.slug !== payload.new.slug) || []),
                  payload.new,
                ]
              }
            }
            setRecords(updated)
          }
        }
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'team_members' },
        (payload: { old: TeamMember }) => {
          if (records.length) {
            const updated = [...records]
            for (let i = 0; i < updated.length; i++) {
              if (updated[i].name === payload.old.team) {
                updated[i].members = updated[i].members?.filter((m) => m.slug !== payload.old.slug) || []
              }
            }
            setRecords(updated)
          }
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(listener)
      supabase.removeChannel(membersListener)
    }
  }, [])

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
  }
}
