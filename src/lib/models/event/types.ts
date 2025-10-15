import { Invitee } from '../invitee/types'

export type InsertCalendarEvent = {
  start_date: string
  team: string
  event_type: string
  name: string
  start_time: string
  invitee_slug: string
  phone: string
  location: string
  slug: string
}

export type CalendarEvent = InsertCalendarEvent & {
  duration: number
  created_at: Date
  created_by: string
  invitees: Invitee[]
}
