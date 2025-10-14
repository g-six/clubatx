export type InsertRecording = {
  slug: string
  event: string
  team: string
}

export type Recording = InsertRecording

export type InsertBooking = {
  team: string
  location: string
  start_date: string
  start_time: string
  booked_by: string
}

export type Booking = InsertBooking & { created_at: Date }
