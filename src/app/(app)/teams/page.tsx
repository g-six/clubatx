import { Heading } from '@/components/heading'
import type { Metadata } from 'next'
import LocationsPageClientComponent from './client-component'

const title = 'Teams'
export const metadata: Metadata = {
  title,
}

export default async function Events() {
  return (
    <>
      <Heading>{title}</Heading>
      <LocationsPageClientComponent />
      <div className="h-24 sm:hidden" />
    </>
  )
}
