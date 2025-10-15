import { Heading } from '@/components/heading'
import { getEvents } from '@/data'
import type { Metadata } from 'next'
import EventsPageClientComponent from './client-component'

export const metadata: Metadata = {
  title: 'Events',
}

export default async function Events() {
  let events = await getEvents()

  return (
    <>
      <Heading>Events</Heading>
      <EventsPageClientComponent data-events={events} />
    </>
  )
}
