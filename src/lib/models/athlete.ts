import { Dispatch, SetStateAction } from 'react'
import { supabase } from '../store'
import { Athlete, InsertAthlete } from '../types/athlete.types'
/**
 * Inserts a new athlete record into the database.
 *
 * @param record - The athlete details to insert.
 * @param user_id - The ID of the user creating the athlete.
 * @returns A promise that resolves to an array of inserted athlete objects, or undefined if an error occurs.
 *
 * @example
 * ```typescript
 * const newAthlete: InsertAthlete = { name: "Main Hall" };
 * const Athletes = await addAthlete(newAthlete, 123);
 * ```
 */
export const addAthlete = async (record: InsertAthlete, user_id: string): Promise<Athlete[] | undefined> => {
  try {
    let { data } = await supabase
      .from('athletes')
      .insert([{ ...record, created_by: user_id }])
      .select()
    return data as Athlete[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all athletes
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchAthletes = async (
  user_id: string,
  setState?: Dispatch<SetStateAction<Athlete[]>>
): Promise<Athlete[] | undefined> => {
  try {
    let { data } = await supabase.from('athletes').select('*').eq('created_by', user_id)
    data = data || []
    const { data: team_members } = await supabase
      .from('team_members')
      .select('team_roster(athlete(*))')
      .eq('user', user_id)
    for (const { team_roster } of team_members || []) {
      for (const roster of team_roster) {
        const { athlete } = roster as unknown as { athlete: Athlete }
        if (!data.find((predicate) => predicate.slug === athlete.slug)) {
          data.push(athlete)
        }
      }
    }
    if (setState && data) setState(data)
    return data as Athlete[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch specific athletes
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const filterAthletes = async (
  slugs: string[],
  setState?: Dispatch<SetStateAction<Athlete[]>>
): Promise<Athlete[] | undefined> => {
  try {
    let { data } = await supabase.from('athletes').select('*').in('slug', slugs)
    if (setState && data) setState(data)
    return data as Athlete[]
  } catch (error) {
    console.log('error', error)
  }
}
