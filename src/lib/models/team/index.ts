import { InsertTeam, Team } from '@/lib/models/team/types'
import { supabase } from '@/lib/store'
import { Athlete } from '@/lib/types/athlete.types'
import { Dispatch, SetStateAction } from 'react'
/**
 * Inserts a new team record into the database.
 *
 * @param record - The team details to insert.
 * @param user_id - The ID of the user creating the team.
 * @returns A promise that resolves to an array of inserted team objects, or undefined if an error occurs.
 *
 * @example
 * ```typescript
 * const newTeam: InsertTeam = { name: "Main Hall" };
 * const Teams = await addTeam(newTeam, 123);
 * ```
 */
export const addTeam = async (record: InsertTeam, user_id: string): Promise<Team[] | undefined> => {
  try {
    let { data } = await supabase
      .from('teams')
      .insert([{ ...record, created_by: user_id }])
      .select()
    return data as Team[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all teams
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchTeams = async (
  user_id: string,
  setState?: Dispatch<SetStateAction<Team[]>>
): Promise<Team[] | undefined> => {
  try {
    let { data } = await supabase
      .from('teams')
      .select('*, administrator:created_by(username)')
      .eq('created_by', user_id)
    const teams = data as Team[]

    const { data: memberOf } = await supabase
      .from('team_members')
      .select('roster:team_roster(athlete), member:user(username), team(*, administrator:created_by(username))')
    for (const m of (memberOf || []) as unknown as {
      administrator: { username: string }
      member: { username: string }
      roster?: {
        athlete: Athlete
      }
      team: Team
    }[]) {
      const idx = teams.findIndex((t) => t.name === m.team.name)
      if (idx === -1) teams.push(m.team)
      else teams[idx] = m.team
    }

    if (setState && teams) setState(teams)
    return teams
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific teams
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const filterTeams = async (
  pattern: string,
  setState?: Dispatch<SetStateAction<Team[]>>
): Promise<Team[] | undefined> => {
  try {
    let { data } = await supabase.from('teams').select('*').ilike('name', pattern)
    if (setState && data) setState(data)
    return data as Team[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific teams
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const filterTeamMemberships = async (
  email_or_id: string,
  pattern?: string,
  setState?: Dispatch<SetStateAction<Team[]>>
): Promise<Team[] | undefined> => {
  try {
    const user = await supabase.from('users').select('username, id').ilike('username', email_or_id).single()
    if (user?.data?.id) {
      let teams: Team[] = []
      let results = await supabase.from('teams').select().eq('created_by', user.data.id)
      for (const team of results?.data || []) {
        const { name, short_name } = team
        teams.push({
          name,
          short_name,
        } as Team)
      }

      results = await supabase
        .from('team_members')
        .select('team:teams(*)')
        .or(`user.eq.${user.data.id}, created_by.eq.${user.data.id}`)
      for (const m of results?.data || []) {
        const { name, short_name } = m.team
        if (!teams.find((t) => t.name === name))
          teams.push({
            name,
            short_name,
          } as Team)
      }

      if (setState && teams) setState(teams)
      return teams
    }
  } catch (error) {
    console.log('error', error)
  }
}
