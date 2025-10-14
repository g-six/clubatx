import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { parseForm } from '@/lib/form'
import { addLocation, Location } from '@/lib/models/location'
import UserContext from '@/lib/user-context'
import { MapPinIcon } from '@heroicons/react/20/solid'
import { FormEvent, useContext, useState } from 'react'
import { LocationType } from './types'

const entity = 'Location'
export function CreateItemDialog() {
  const ctx = useContext(UserContext)

  let [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('Save')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ctx.user) return

    const form = event.currentTarget
    const data = parseForm(form) as unknown as Location
    try {
      setStatus('Creating...')
      await addLocation(data, ctx.user.id)
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
        <MapPinIcon />
        Add new location
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <form action="" method="POST" onSubmit={handleSubmit}>
          <DialogTitle>New Location</DialogTitle>
          <DialogDescription>Please fill in the details for the new location.</DialogDescription>
          <DialogBody>
            {/* ... */}
            <Fieldset>
              <FieldGroup>
                <Field className="lg:col-span-2">
                  <Label>Name</Label>
                  <Input name="name" autoFocus />
                </Field>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
                  <Field className="sm:col-span-2">
                    <Label>Street address</Label>
                    <Input name="street_1" />
                  </Field>

                  <Field>
                    <Label>Postal code</Label>
                    <Input name="postal_zip_code" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
                  <Field className="sm:col-span-2">
                    <Label>City / Town</Label>
                    <Input name="city_town" />
                  </Field>
                  <Field>
                    <Label>Type</Label>
                    <Select name="facility_type">
                      {Object.entries(LocationType).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value
                            .toLowerCase()
                            .split(' ')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </Fieldset>
            {/* ... */}
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="min-w-24" type="submit">
              {status}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
