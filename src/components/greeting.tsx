'use client'

import UserContext from '@/lib/user-context'
import { useContext } from 'react'
import { Heading } from './heading'

export default function Greeting() {
  const ctx = useContext(UserContext)

  return (
    <Heading>
      Good{' '}
      {new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(new Date()).endsWith('PM')
        ? 'evening'
        : 'morning'}
      , {ctx.user?.first_name}
    </Heading>
  )
}
