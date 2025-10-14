import { Logo } from '@/app/logo'

import type { Metadata } from 'next'
import ClientComponent from './client-component'

export const metadata: Metadata = {
  title: 'Register',
}

export default function Register() {
  return (
    <div className="w-full max-w-xs">
      <Logo size="sm" data-logo-only />
      <ClientComponent />
    </div>
  )
}
