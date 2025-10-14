import { Athlete } from '@/lib/types/athlete.types'

export type InsertTeam = {
  name: string
  short_name?: string
}

export type Team = InsertTeam & {
  created_at: Date
  created_by: string
  members?: TeamMember[]
  administrator?: {
    username: string
  }
}

export type InsertTeamMember = {
  slug: string
  team: string
  user: string
  role?: 'manager' | 'parent' | 'parent coach' | 'coach' | 'assistant' | 'organization owner'
}

export type TeamMember = InsertTeamMember & {
  created_at: Date
  created_by: string
  administrator?: {
    username: string
  }
}

export interface UserTeam {
  name: string
  short_name: string
  member: string
  role: string
  roster: (Athlete & { athlete?: string; positions: string[] })[]
}
