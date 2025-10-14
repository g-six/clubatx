import { supabase } from '@/lib/store'
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Location } from '../location'

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>()

  function reloadLocations(payload?: { new?: any; old?: any }) {
    supabase
      .from('locations')
      .select()
      .then((d) => setLocations(((d.data as Location[]) || []).sort((a, b) => a.name.localeCompare(b.name))))
  }

  useEffect(() => {
    reloadLocations()

    const locationsListener = supabase
      .channel('public:locations')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'locations' },
        reloadLocations
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'locations' },
        reloadLocations
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'locations' },
        reloadLocations
      )
      .subscribe()

    return () => {
      locationsListener.unsubscribe()
    }
  }, [])
  return locations
}
