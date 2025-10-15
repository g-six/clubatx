import { UserTeam } from '@/lib/models/team/types'
import { Athlete } from '@/lib/types/athlete.types'
import { CalendarEvent } from '../event/types'

export interface ClubAtxUser {
  id?: string
  status?: 'ONLINE' | 'OFFLINE'
  first_name?: string
  last_name?: string
  phone?: string
  username?: string
  athletes?: Athlete[]
  roles?: string[]
  teams?: UserTeam[]
  calendar?: CalendarEvent[]
}
