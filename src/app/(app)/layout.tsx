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
    </ApplicationLayout>
  )
}
