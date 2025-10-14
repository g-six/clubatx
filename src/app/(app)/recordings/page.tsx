import { Heading } from '@/components/heading'
import type { Metadata } from 'next'
import ClientComponent from './client-component'
import { CreateItemDialog } from './create'

export const metadata: Metadata = {
  title: 'Orders',
}

export default async function RecordingsPage() {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Recordings</Heading>
        <CreateItemDialog />
      </div>
      <ClientComponent />
    </>
  )
}
