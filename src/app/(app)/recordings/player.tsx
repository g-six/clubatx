'use client'
import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Textarea } from '@/components/textarea'
import { Stream } from '@cloudflare/stream-react'

import { XCircleIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

export function ViewDialog(p: { name?: string; src: string; startTime?: number; className?: string }) {
  let [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('view')

  return (
    <>
      {p.name ? (
        <button
          type="button"
          className={p.className || 'cursor-pointer pr-1 font-medium text-gray-900 hover:underline dark:text-white'}
          onClick={() => setIsOpen(true)}
        >
          {p.name}
        </button>
      ) : (
        <Button type="button" onClick={() => setIsOpen(true)}>
          View
        </Button>
      )}
      <Dialog open={isOpen} onClose={setIsOpen} size="5xl">
        <div className="relative w-full">
          <DialogTitle>View Recording</DialogTitle>
          <button className="absolute! -top-12 -right-12" onClick={() => setIsOpen(false)}>
            <XCircleIcon className="h-10 w-10 text-zinc-400 hover:text-zinc-600" />
          </button>
        </div>
        <DialogDescription></DialogDescription>
        <DialogBody>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Stream controls {...p} onLoadedMetaData={console.log} />
          </div>
          <div className={mode === 'notes' ? 'relative mt-8 w-full' : 'hidden'}>
            <Textarea rows={10} />
          </div>
        </DialogBody>
        <DialogActions>
          <Button
            onClick={() => {
              mode === 'view' ? setMode('notes') : setMode('view')
            }}
            plain={(mode === 'view' ? undefined : true) as any}
          >
            {mode === 'view' ? 'Add notes' : 'Back to video'}
          </Button>
          {mode === 'notes' && <Button onClick={() => {}}>Save notes</Button>}
        </DialogActions>
      </Dialog>
      {/* ... */}
    </>
  )
}
