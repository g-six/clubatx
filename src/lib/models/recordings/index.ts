import { supabase } from '@/lib/store'
import { Booking, InsertBooking, InsertRecording, Recording } from './types'

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
export const addRecording = async (record: InsertRecording): Promise<Recording | undefined> => {
  try {
    let { data } = await supabase.from('recordings').insert([record]).select().single()
    return data as Recording
  } catch (error) {
    console.log('error', error)
  }
}

export const bookRecording = async (record: InsertBooking): Promise<Booking | undefined> => {
  try {
    let { data } = await supabase.from('bookings').insert([record]).select().single()
    return data as Booking
  } catch (error) {
    console.log('error', error)
  }
}
