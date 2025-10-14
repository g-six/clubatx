import { Link } from '@/components/link'
import ClientComponent from './client-component'

import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  let { id } = await params

  return {
    title: `Channel #${id}`,
  }
}

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/channels" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Channels
        </Link>
      </div>

      <ClientComponent data-id={id} />
    </>
  )
}
