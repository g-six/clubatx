export type InsertAthlete = {
  slug: string
  first_name: string
  last_name?: string
  date_of_birth?: string
  phone?: string
  street_1?: string
  street_2?: string
}

export type Athlete = InsertAthlete & {
  city_town: string
  state_province: string
  postal_zip_code: string
  country: string
  created_at: Date
  created_by: string
}
