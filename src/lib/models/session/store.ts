import { supabase } from '@/lib/store'
import { Athlete } from '@/lib/types/athlete.types'
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { useEffect, useState } from 'react'
import { CalendarEvent } from '../event/types'
import { Invitee } from '../invitee/types'
import { UserTeam } from '../team/types'
import { ClubAtxUser } from '../user/types'

export function useApp({ token }: { token: string }) {
  const [user, setUser] = useState<ClubAtxUser>()
  const [calendar, setCalendar] = useState<CalendarEvent[]>()
  const [teams, setTeams] = useState<UserTeam[]>()
  const [roles, setRoles] = useState<string[]>()
  function reloadData(payload?: { new?: any; old?: any }) {
    // new Audio('/sounds/new-message.mp3').play()

    if (token) {
      const { first_name, last_name, username, id: user_id } = jwt.decode(token) as Record<string, string>
      let { calendar: cals } = user || { calendar: [] }

      if (first_name && last_name && username && user?.teams === undefined) {
        if (user_id) {
          Promise.all([
            supabase.from('user_roles').select().eq('user_id', user_id),
            supabase
              .from('team_members')
              .select('slug, team(*), role, team_roster(slug, jersey_number, positions, athlete(*))')
              .eq('user', user_id),
            supabase
              .from('athletes')
              .select('*, team_roster(slug, jersey_number, positions, team(*))')
              .eq('created_by', user_id),
            supabase
              .from('teams')
              .select('*, team_members(*, team_roster(slug, jersey_number, positions, athlete(*)))')
              .eq('created_by', user_id),
          ]).then(([user_roles, team_members, athletes, teams_created]) => {
            setRoles(user_roles?.data?.map((r) => r.role))
            const ts: UserTeam[] = []
            for (const m of team_members?.data || []) {
              const { slug, role, team, team_roster } = m as unknown as {
                slug: string
                role: string
                team: { name: string; short_name: string; events: CalendarEvent[] }
                team_roster: { slug: string; positions: string[]; athlete: Athlete }[]
              }

              const idx = ts.findIndex((t) => t.name === team.name)
              if (idx === -1) {
                ts.push({
                  ...team,
                  role,
                  member: slug,
                  roster: team_roster?.map((tr) => ({
                    athlete: tr.athlete.slug,
                    ...tr.athlete,
                    slug: tr.slug,
                    positions: tr.positions,
                  })),
                })
              } else {
                ts[idx].roster.push(
                  ...team_roster?.map((tr) => ({
                    athlete: tr.athlete.slug,
                    ...tr.athlete,
                    slug: tr.slug,
                    positions: tr.positions,
                  }))
                )
              }
            }

            for (const created_team of teams_created?.data || []) {
              const idx = ts.findIndex((t) => t.name === created_team.name)
              if (idx === -1) {
                let roster = []
                if (created_team.team_members?.length) {
                  for (const { team_roster } of created_team.team_members) {
                    for (const { athlete, jersey_number, positions, slug } of team_roster) {
                      roster.push({
                        athlete: athlete.slug,
                        ...athlete,
                        slug,
                        positions,
                        jersey_number,
                      })
                    }
                  }
                }
                if (idx === -1)
                  ts.push({
                    ...created_team,
                    role: 'admin',
                    roster,
                  })
                else {
                  ts[idx].roster.push(...roster)
                }
              }
            }
            setTeams(ts)

            supabase
              .from('events')
              .select('*, invitees(*, invitee:athlete(first_name, date_of_birth))')
              .gte('start_date', new Date(Date.now() - 1000 * 3600 * 24 * 7).toISOString())
              .ilikeAnyOf(
                'team',
                ts.map((t) => t.name)
              )
              .then((r) => {
                cals = (r?.data || []).sort((b, a) =>
                  `${b.start_date}${b.start_time}`.localeCompare(`${a.start_date}${a.start_time}`)
                )
                setCalendar(cals)
              })

            setUser(
              (prev) =>
                ({
                  id: user_id,
                  ...prev,
                  first_name,
                  last_name,
                  username,
                }) as unknown as ClubAtxUser
            )
          })
        }
      }
    }
  }

  useEffect(() => {
    setUser(
      (prev) =>
        ({
          ...prev,
          calendar,
        }) as unknown as ClubAtxUser
    )
  }, [calendar])

  useEffect(() => {
    setUser(
      (prev) =>
        ({
          ...prev,
          teams,
        }) as unknown as ClubAtxUser
    )
  }, [teams])

  useEffect(() => {
    reloadData()
    const userListener = supabase
      .channel('public:users')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'users' },
        reloadData
      )
      .subscribe()

    const athleteListener = supabase
      .channel('public:athletes')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'athletes' },
        reloadData
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'athletes' },
        reloadData
      )
      .subscribe()

    const inviteeListener = supabase
      .channel('public:invitees')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'invitees' },
        reloadData
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'invitees' },
        reloadData
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'invitees' },
        (payload: { old: Invitee }) => {
          setCalendar((prev) =>
            (prev || []).filter((c) => {
              const idx = calendar?.findIndex((c) => c.slug === payload.old.event)
              if (idx !== -1) {
                for (const evt of prev || []) {
                  if (evt.slug === payload.old.event) {
                    let { invitees } = evt as unknown as { invitees: Invitee[] }
                    invitees = invitees.filter((inv) => inv.athlete !== payload.old.athlete)
                    evt.invitees = invitees
                  }
                }
              }
              return prev
            })
          )
        }
      )
      .subscribe()

    const calendarListener = supabase
      .channel('public:events')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'events' },
        reloadData
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'events' },
        reloadData
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'events' },
        (payload) => {
          setCalendar((prev) => (prev || []).filter((c) => c.slug !== payload.old.slug))
        }
      )
      .subscribe()

    return () => {
      userListener.unsubscribe()
      athleteListener.unsubscribe()
      inviteeListener.unsubscribe()
      calendarListener.unsubscribe()
    }
  }, [])

  return {
    ...user,
    roles,
  }
}
