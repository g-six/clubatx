import { Athlete } from '@/lib/types/athlete.types'

export type InsertInvitee = {
  athlete: string
  event: string
  status: 'PENDING' | 'GOING' | 'NOT_GOING' | 'ATTENDED' | 'ABSENT'
}

export type Invitee = InsertInvitee & {
  invited_at: Date
  invited_by: string
  invitee?: Athlete
  last_notified_at?: Date
}

export type InviteeAthlete = Invitee & {
  athlete: {
    first_name: string
    phone: string
  }
}
