'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Textarea } from '@/components/textarea'
import { getFormattedTime } from '@/lib/helpers/datetime'
import { useState } from 'react'

export function NotifyComponent(p: {
  toggleOpen: (message: string) => void
  handleSubmit?: (selected: string[], message: string) => void
  'data-event': Record<string, string>
  'data-items': Record<string, string>[]
  'data-call-to-action': string
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState(
    `${p['data-event'].event_type.at(0)?.toUpperCase() + p['data-event'].event_type.slice(1)} scheduled ${getFormattedTime(p['data-event'].start_date, p['data-event'].start_time, ' - ')} at ${p['data-event'].location}.\nReply with a Y or N to notify our coaches.\n- clubathletix.com -`
  )

  return (
    <>
      <Dialog size="xl" open={Boolean(p['data-call-to-action'])} onClose={() => {}}>
        <DialogTitle>Send a notification</DialogTitle>
        <DialogDescription>Select the team members to notify.</DialogDescription>
        <DialogBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p['data-items'].map((person, idx) => (
              <div
                key={idx}
                data-object={JSON.stringify(person)}
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

          <Field className="mt-8">
            <Label>Message</Label>
            <Textarea rows={4} defaultValue={message} onChange={(e) => setMessage(e.currentTarget.value)} />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => p.toggleOpen('')}>
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0}
            color={selected.length === 0 ? 'zinc' : 'lime'}
            onClick={() => {
              setSelected([])
              p.handleSubmit?.(selected, message)
            }}
          >
            {p['data-call-to-action'] || 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
