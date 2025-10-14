import { Logo } from '@/app/logo'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import ClientComponent from './client-component'

export const metadata: Metadata = {
  title: 'Login',
}

export default function Login() {
  return (
    <div className="w-full max-w-xs">
      <Logo size="sm" data-logo-only />
      <Suspense fallback={<>...</>}>
        <ClientComponent />
      </Suspense>
    </div>
  )
}
