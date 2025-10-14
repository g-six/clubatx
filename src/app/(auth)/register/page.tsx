import { Logo } from '@/app/logo'

import type { Metadata } from 'next'
import ClientComponent from './client-component'

export const metadata: Metadata = {
  title: 'Register',
}

export default function Register() {
  return (
    <div className="w-full max-w-xs">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <ClientComponent />
    </div>
  )
}
