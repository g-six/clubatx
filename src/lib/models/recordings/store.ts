'use client'
import { supabase } from '@/lib/store'
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { useEffect, useState } from 'react'

export default function useRecordings() {
  const token = localStorage.getItem('token') || ''
  const { id, username } = jwt.decode(token) as Record<string, string>
  const [recordings, setRecordings] = useState<
    {
      slug: string
      team: string
      location: string
      starts_at_second: number
      event_time: string
      event_date: string
      event_type: string
      status?: string
    }[]
  >([])

  async function fetchRecordings() {
    console.log('fetchRecordings triggered')
    Promise.all([
      supabase.from('team_members').select('team(recordings(*))').eq('user', id),
      supabase.from('bookings').select('*').eq('booked_by', username),
    ]).then(([x, bookings]) => {
      const recs =
        x.data
          ?.map((tm) => {
            const { recordings } = tm.team as unknown as {
              recordings: {
                slug: string
                starts_at_second: number
                team: string
                location: string
                event_type: string
                event_date: string
                event_time: string
              }[]
            }
            return recordings.map((r) => ({
              ...r,
              slug: r.slug,
              team: r.team,
            }))
          })
          .flat() || []
      for (const booking of bookings?.data || []) {
        recs.push({
          ...booking,
          event_date: booking.start_date,
          event_time: booking.start_time,
          slug: booking.id,
          event_type: 'MATCH',
          status: booking.status || 'PENDING',
        })
      }
      setRecordings(recs)
    })
  }

  useEffect(() => {
    fetchRecordings()

    // Listen for new and deleted bookings
    const bookingsListener = supabase
      .channel('public:bookings')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        fetchRecordings
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        fetchRecordings
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'bookings' },
        fetchRecordings
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(bookingsListener)
    }
  }, [])

  return recordings
}
