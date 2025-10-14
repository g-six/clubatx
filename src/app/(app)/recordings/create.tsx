'use client'
import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { parseForm } from '@/lib/form'
import { addCalendarEvent } from '@/lib/models/event'

import { useLocations } from '@/lib/models/location/store'
import { bookRecording } from '@/lib/models/recordings'
import UserContext from '@/lib/user-context'
import { FormEvent, useContext, useState } from 'react'
import { InsertCalendarEvent } from '../../../lib/models/event/types'

export function CreateItemDialog() {
  const ctx = useContext(UserContext)
  const locations = useLocations() || []
  const [status, setStatus] = useState('Create')

  let [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ctx.user?.id) return

    const form = event.currentTarget
    const data = parseForm(form) as unknown as InsertCalendarEvent
    try {
      setStatus('Creating...')

      const evt = await addCalendarEvent(
        {
          ...data,
          slug: [
            data.start_date.replace('-', ''),
            data.start_time.replace(':', ''),
            data.team.replace(/\s+/g, '-').toLowerCase(),
          ].join('-'),
        },
        ctx.user.id
      )

      if (evt && ctx.user?.username)
        await bookRecording({
          team: data.team,
          location: data.location,
          start_date: data.start_date,
          start_time: data.start_time,
          booked_by: ctx.user.username,
        })

      form.reset()

      setIsOpen(false)
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setStatus('Save')
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Book a recording
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <form action="" method="POST" onSubmit={handleSubmit}>
          <DialogTitle>Book a recording</DialogTitle>
          <DialogDescription>Please fill in the details for the new recording.</DialogDescription>
          <DialogBody>
            {/* ... */}
            <Fieldset>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
                  <Field className="sm:col-span-2">
                    <Label>Team</Label>
                    <Select name="team" autoFocus>
                      {(ctx.user?.teams || []).map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <Label>Event type</Label>
                    <Select name="event_type">
                      <option value="training">Training</option>
                      <option value="match">Match</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
                  <Field className="sm:col-span-2">
                    <Label>Location</Label>
                    <Select name="location">
                      {locations.map((l) => (
                        <option key={l.name} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-4">
                  <Field className="sm:col-span-2">
                    <Label>Day</Label>
                    <Input
                      type="date"
                      name="start_date"
                      defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </Field>
                  <Field>
                    <Label>Time</Label>
                    <Input type="time" name="start_time" defaultValue="17:00" />
                  </Field>
                  <Field>
                    <Label>Duration</Label>
                    <Input type="number" step="15" name="duration" defaultValue={60} />
                  </Field>
                </div>
              </FieldGroup>
            </Fieldset>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{status}</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* ... */}
    </>
  )
}
