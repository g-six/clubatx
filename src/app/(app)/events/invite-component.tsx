'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { useAthleteStore } from '@/lib/athlete.store'
import { useState } from 'react'

export function InviteComponent(p: {
  isOpen?: boolean
  toggleOpen: (isOpen: boolean) => void
  handleSubmit?: (selected: string[]) => void
}) {
  const athlete = useAthleteStore()
  const [selected, setSelected] = useState<string[]>([])

  return (
    <>
      <Dialog size="xl" open={p.isOpen} onClose={() => {}}>
        <DialogTitle>Invite team member</DialogTitle>
        <DialogDescription>Send an invitation to a team member to join this event.</DialogDescription>
        <DialogBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {athlete.records.map((person) => (
              <div
                key={person.slug}
                data-selected={selected.includes(person.slug) ? '' : undefined}
                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-xs hover:border-gray-400 data-selected:outline-2 data-selected:outline-offset-2 data-selected:outline-cyan-600 dark:border-white/10 dark:bg-gray-800/50 dark:shadow-none dark:hover:border-white/25 dark:data-selected:outline-cyan-500"
                onClick={() => {
                  if (selected.includes(person.slug)) selected.splice(selected.indexOf(person.slug), 1)
                  else selected.push(person.slug)
                  setSelected([...selected])
                }}
              >
                <div className="min-w-0 flex-1 focus:outline-hidden">
                  <span aria-hidden="true" className="absolute inset-0" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{person.first_name}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{person.date_of_birth}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => p.toggleOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setSelected([])
              p.handleSubmit?.(selected)
            }}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
