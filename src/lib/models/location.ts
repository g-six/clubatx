import { Dispatch, SetStateAction } from 'react'
import { supabase } from '../store'

export type LocationInsert = {
  name: string
  street_1?: string
  street_2?: string
  city_town?: string
  postal_zip_code?: string
  state_province?: string
  facility_type: string
}
export type Location = {
  created_at: Date
  created_by: string
} & LocationInsert

/**
 * Inserts a new location record into the database.
 *
 * @param record - The location details to insert.
 * @param user_id - The ID of the user creating the location.
 * @returns A promise that resolves to an array of inserted Location objects, or undefined if an error occurs.
 *
 * @example
 * ```typescript
 * const newLocation: LocationInsert = { name: "Main Hall" };
 * const locations = await addLocation(newLocation, 123);
 * ```
 */
export const addLocation = async (record: LocationInsert, user_id: string): Promise<Location[] | undefined> => {
  try {
    let { data } = await supabase
      .from('locations')
      .insert([{ ...record, created_by: user_id }])
      .select()
    return data as Location[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all locations
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchLocations = async (
  setState?: Dispatch<SetStateAction<Location[]>>
): Promise<Location[] | undefined> => {
  try {
    let { data } = await supabase.from('locations').select('*')
    if (setState && data) setState(data)
    return data as Location[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all locations
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const filterLocations = async (
  pattern: string,
  setState?: Dispatch<SetStateAction<Location[]>>
): Promise<Location[] | undefined> => {
  try {
    let { data } = await supabase.from('locations').select('*').ilike('name', pattern)
    if (setState && data) setState(data)
    return data as Location[]
  } catch (error) {
    console.log('error', error)
  }
}
