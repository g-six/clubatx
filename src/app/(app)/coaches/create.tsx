import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Description, Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'
import { fetchLocations, Location } from '@/lib/models/location'
import { useEffect, useState } from 'react'

export function CreateItemDialog() {
  let [isOpen, setIsOpen] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  useEffect(() => {
    fetchLocations(setLocations)
  }, [])
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Create event
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Create an event</DialogTitle>
        <DialogDescription>Please fill in the details for the new event.</DialogDescription>
        <DialogBody>
          <form action="/orders" method="POST">
            {/* ... */}
            <Fieldset>
              <FieldGroup>
                <Field className="lg:col-span-2">
                  <Label>Event name</Label>
                  <Input name="name" />
                </Field>
                <Field>
                  <Label>Street address</Label>
                  <Input name="street_address" />
                </Field>
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
                  <Field>
                    <Label>Event type</Label>
                    <Select name="event_type">
                      <option value="training">Training</option>
                      <option value="match">Match</option>
                      <option value="meeting">Meeting</option>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <Label>Delivery notes</Label>
                  <Textarea name="notes" />
                  <Description>If you have a tiger, we&rsquo;d like to know about it.</Description>
                </Field>
              </FieldGroup>
            </Fieldset>
            {/* ... */}
          </form>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>Refund</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
