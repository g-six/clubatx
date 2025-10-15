'use client'

import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { KeyIcon } from '@heroicons/react/16/solid'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import ClientComponent from './client-component'

export default function LoginDialogComponent({ searchParams }: { searchParams: Promise<{ [k: string]: string }> }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="sm:hidden">
        <button
          type="button"
          className="flex size-16 items-center justify-center"
          onClick={() => {
            console.log('login')
            setOpen(true)
          }}
        >
          <ArrowRightEndOnRectangleIcon className="size-8" />
        </button>
      </div>
      <div className="max-sm:hidden">
        <Button onClick={() => setOpen(true)} color="rose">
          <KeyIcon />
          Login
        </Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} size="xs">
        <ClientComponent searchParams={searchParams} />
      </Dialog>
    </>
  )
}
