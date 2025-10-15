import { Heading } from '@/components/heading'
import type { Metadata } from 'next'
import EventsPageClientComponent from './client-component'

export const metadata: Metadata = {
  title: 'Events',
}

export default async function Events() {
  return (
    <>
      <Heading className="max-sm:hidden">Events</Heading>
      <EventsPageClientComponent />
    </>
  )
}
