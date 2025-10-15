import { Cookies } from '@/lib/helpers/cookie'
import { CalendarEvent, InsertCalendarEvent } from '@/lib/models/event/types'
import { supabase } from '@/lib/store'
import { Dispatch, SetStateAction } from 'react'

const cookies = Cookies()
/**
 * Inserts a new event record into the database.
 *
 * @param record - The event details to insert.
 * @param user_id - The ID of the user creating the event.
 * @returns A promise that resolves to an array of inserted event objects, or undefined if an error occurs.
 *
 * @example
 * ```typescript
 * const newEvent: InsertCalendarEvent = { name: "Main Hall" };
 * const calendarEvents = await addCalendarEvent(newEvent, 123);
 * ```
 */
export const addCalendarEvent = async (
  record: InsertCalendarEvent,
  user_id: string
): Promise<CalendarEvent | undefined> => {
  try {
    let data: CalendarEvent | undefined
    let existing = await supabase
      .from('events')
      .select()
      .eq('team', record.team)
      .eq('start_date', record.start_date)
      .eq('start_time', record.start_time)

    if (existing?.data?.length) {
      data = existing.data.pop()
    } else {
      const newRecord = await supabase
        .from('events')
        .insert([{ ...record, created_by: user_id }])
        .select()
        .single()
      console.log(`Searching for existing record: ${newRecord}`, newRecord)
      data = newRecord.data
    }
    return data as CalendarEvent
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all events
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchEvents = async (
  setState?: Dispatch<SetStateAction<CalendarEvent[]>>
): Promise<CalendarEvent[] | undefined> => {
  try {
    let { data } = await supabase.from('events').select('*, invitees(invitee:athlete(slug,first_name,phone))')
    if (setState && data) setState(data)
    return data as CalendarEvent[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch future events only
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchFutureEvents = async (
  setState?: Dispatch<SetStateAction<CalendarEvent[]>>
): Promise<CalendarEvent[] | undefined> => {
  const event_columns = 'slug, team, event_type, start_date, start_time, duration, location'
  try {
    let { data } = await supabase
      .from('events')
      .select('*, invitees(invitee:athlete(slug,first_name,phone))')
      .filter('start_date', 'gte', new Date().toISOString())
      .eq('created_by', cookies.id)

    const { data: athletes } = await supabase.from('athletes').select('invitees(*)').eq('created_by', cookies.id)

    if (setState && data) setState(data)
    return data as CalendarEvent[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific events
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const filterEvents = async (
  pattern: string,
  setState?: Dispatch<SetStateAction<CalendarEvent[]>>
): Promise<CalendarEvent[] | undefined> => {
  try {
    let { data } = await supabase.from('events').select('*').ilike('name', pattern)
    if (setState && data) setState(data)
    return data as CalendarEvent[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific events
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const getEventBySlug = async (
  pattern: string,
  setState?: Dispatch<SetStateAction<CalendarEvent[]>>
): Promise<CalendarEvent[] | undefined> => {
  try {
    let { data } = await supabase
      .from('events')
      .select('*, invitees(invitee:athlete(slug,first_name,phone))')
      .ilike('slug', pattern)
      .single()
    if (setState && data) setState(data)
    return data as CalendarEvent[]
  } catch (error) {
    console.log('error', error)
  }
}
