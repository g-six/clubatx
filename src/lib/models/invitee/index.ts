import { Cookies } from '@/lib/helpers/cookie'
import { supabase } from '@/lib/store'
import { Dispatch, SetStateAction } from 'react'
import { CalendarEvent } from '../event/types'
import { Team } from '../team/types'
import { InsertInvitee, Invitee, InviteeAthlete } from './types'
const cookies = Cookies()
/**
 * Inserts a new invitee record into the database.
 *
 * @param record - The invitee details to insert.
 * @param user_id - The ID of the inviting user.
 * @returns A promise that resolves to an array of inserted invitee objects, or undefined if an error occurs.
 *
 * @example
 * ```typescript
 * const newEvent: InsertInvitee = { name: "Main Hall" };
 * const calendarEvents = await inviteAthlete(newEvent, 123);
 * ```
 */
export const inviteAthlete = async (record: InsertInvitee, invited_by: string): Promise<Invitee[] | undefined> => {
  try {
    let { data } = await supabase
      .from('invitees')
      .insert([{ ...record, invited_by }])
      .select()
    return data as Invitee[]
  } catch (error) {
    console.log('error', error)
  }
}
export const inviteAthletes = async (records: InsertInvitee[], invited_by: string): Promise<Invitee[] | undefined> => {
  try {
    let { data } = await supabase
      .from('invitees')
      .insert(
        records.map((record) => ({
          ...record,
          invited_by,
        }))
      )
      .select('*, invitee:athlete(slug,first_name)')
    return data as Invitee[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all invitees
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchInvitees = async (setState?: Dispatch<SetStateAction<Invitee[]>>): Promise<Invitee[] | undefined> => {
  try {
    const event_columns = 'slug, team, event_type, start_date, start_time, duration, location'
    let { data } = await supabase.from('invitees').select(`*, event(${event_columns})`).eq('invited_by', cookies.id)
    data = data || []
    const { data: team_members } = await supabase
      .from('team_members')
      .select(`team(events(${event_columns})), team_roster(athlete(*, invited_to:invitees(*)))`)
      .eq('user', cookies.id)

    for (const { team_roster, ...tm } of team_members || []) {
      const team = tm.team as unknown as Team & { events: CalendarEvent[] }
      for (const roster of team_roster) {
        const {
          athlete: { invited_to, ...record },
        } = roster as unknown as {
          athlete: {
            invited_to: {
              athlete: string
              event: string
              status: string
              invited_at: Date
              iinvted_by: string
            }[]
          }
        }

        data = [
          ...data,
          ...invited_to.filter((add) => !data?.find((d) => !team.events.map((evt) => evt.slug).includes(d.event.slug))),
        ]
      }
    }

    if (setState && data) setState(data)
    return data as Invitee[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific invitees
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const filterInvitees = async (
  pattern: string,
  setState?: Dispatch<SetStateAction<Invitee[]>>
): Promise<Invitee[] | undefined> => {
  try {
    let { data } = await supabase.from('invitees').select('*').ilike('athlete', pattern)
    if (setState && data) setState(data)
    return data as Invitee[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific invitees
 * @param {Array} slugs
 */
export const filterManyInvitees = async (slugs: string[], event: string): Promise<InviteeAthlete[] | undefined> => {
  try {
    let { data } = await supabase
      .from('invitees')
      .select('*, athlete(first_name, phone)')
      .ilikeAnyOf('athlete', slugs)
      .ilike('event', event)
    return data as InviteeAthlete[]
  } catch (error) {
    console.log('error', error)
  }
}
