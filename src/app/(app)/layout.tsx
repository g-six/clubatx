import { BookDialog } from '@/components/book'
import { headers } from 'next/headers'
import { ApplicationLayout } from './application-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const cookieStore = h.get('cookie') || ''

  return (
    <ApplicationLayout
      data-token={
        cookieStore
          .split('; ')
          .find((c) => c.startsWith('token='))
          ?.split('=')[1]
      }
    >
      {children}

      <div
        role="button"
        className="fixed w-full max-sm:bottom-6 max-sm:left-1/2 max-sm:max-w-sm max-sm:-translate-x-1/2 sm:top-0 sm:right-0 sm:hidden"
      >
        <div className="flex w-full justify-center max-sm:rounded-3xl max-sm:bg-black/80 sm:justify-end">
          {/** Repeat elements with this */}
          <div className="sm:py-2 sm:not-last:px-2 sm:last:pr-2">
            <BookDialog />
          </div>
        </div>
      </div>
    </ApplicationLayout>
  )
}
