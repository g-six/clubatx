'use client'
import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { parseForm } from '@/lib/form'
import * as Headless from '@headlessui/react'

import { postRequest } from '@/lib/helpers/api'
import { useLocations } from '@/lib/models/location/store'
import { signUp } from '@/lib/models/session'
import { filterTeamMemberships } from '@/lib/models/team'
import { Team } from '@/lib/models/team/types'
import { supabase } from '@/lib/store'
import { XCircleIcon } from '@heroicons/react/16/solid'
import { FormEvent, useEffect, useState } from 'react'
import { Select } from './select'

export function BookDialog() {
  const locations = useLocations() || []
  const [locationFreeForm, setLocationFreeForm] = useState(false)
  const [status, setStatus] = useState('Create')
  const [teamKeyword, setTeamKeyword] = useState('')
  const [email, setEmail] = useState('')
  const [teams, setTeams] = useState<Team[]>([])

  // Debounce teamKeyword updates
  useEffect(() => {
    const handler = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email) && teamKeyword.length >= 3) {
        filterTeamMemberships(email, `${teamKeyword}%`, setTeams)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [teamKeyword, email])

  let [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const { team, start_date, start_time, ...data } = parseForm(form) as unknown as {
      email: string
      phone: string
      first_name: string
      last_name: string
      team: string
      location: string
      start_date: string
      start_time: string
    }
    try {
      setStatus('Creating...')
      const result = await signUp(data)
      if (result?.session) {
        const booking = await supabase
          .from('bookings')
          .insert({
            booked_by: data.email,
            team,
            location: data.location,
            start_date,
            start_time,
          })
          .select()
          .single()
        if (booking?.data) {
          const email = await postRequest('/api/email', {
            TemplateAlias: 'user-login',
            TemplateModel: {
              action_url: `${location.href.split('/').slice(0, 3).join('/')}/login?code=${result.session.code}&booking=${booking.data.id}`,
              name: data.first_name,
            },
            To: 'gerard@nerubia.com',
          })

          if (email?.Message === 'OK') {
            alert('Booking created! Please check your email for login details.')
            form.reset()
            setStatus('Close')
            setIsOpen(false)
          }
        }
      }
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      // setStatus('Save')
    }
  }
  console.table(teams)
  return (
    <>
      <Button color="rose" className="mt-4 w-full py-2! text-xl!" onClick={() => setIsOpen(true)}>
        Book now
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen} size="md">
        <form action="" method="POST" onSubmit={handleSubmit}>
          <DialogTitle>Book a recording</DialogTitle>
          <DialogDescription>Please fill in the details for the new recording.</DialogDescription>
          <DialogBody>
            {/* ... */}
            <Fieldset>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-2">
                  <Field className="sm:col-span-2">
                    <Label>Email</Label>
                    <Input onChange={(e) => setEmail(e.target.value)} type="email" name="email" autoFocus />
                  </Field>

                  <Field>
                    <Label>Phone</Label>
                    <Input name="phone" type="tel" />
                  </Field>
                </div>

                <Headless.Field className="flex flex-wrap items-center justify-center gap-y-2">
                  <Label className="w-full">Enter contact name</Label>

                  <Input
                    name="first_name"
                    className="rounded-0! w-1/2! rounded-l"
                    inputClassName="rounded-l-lg border-y border-l"
                    placeholder="Enter first name"
                  />
                  <Input
                    name="last_name"
                    className="rounded-0! w-1/2! rounded-r"
                    inputClassName="rounded-r-lg border-y border-r"
                    placeholder="Enter last name"
                  />
                </Headless.Field>
                <Field>
                  <Label>Team name</Label>
                  <Input
                    name="team"
                    value={teamKeyword}
                    onChange={(evt) => {
                      setTeamKeyword(evt.target.value)
                    }}
                  />
                  <div className="relative w-full">
                    <div className="backdrop-blur-2xl/50 absolute top-1 z-10 max-h-40 w-full rounded-xl bg-black">
                      {teamKeyword.length >= 2 &&
                        !teams.find((t) => t.name.toLowerCase() === teamKeyword.toLowerCase()) &&
                        teams
                          .filter((team) => team.name.toLowerCase().startsWith(teamKeyword.toLowerCase()))
                          .map((team) => (
                            <Button
                              key={team.name}
                              onClick={() => {
                                setTeamKeyword(team.name)
                                setTeams([])
                              }}
                              color="rose"
                              className="m-0.5"
                            >
                              {team.name}
                            </Button>
                          ))}
                    </div>
                  </div>
                </Field>

                <Field className="relative">
                  <Label>Location</Label>
                  {!locationFreeForm && (
                    <Select
                      name="location"
                      onChange={(e) => {
                        if (e.target.value === 'Others...') {
                          setLocationFreeForm(true)
                        }
                      }}
                    >
                      {locations.map(({ name }) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                      <option>Others...</option>
                    </Select>
                  )}
                  {locationFreeForm && (
                    <>
                      <Input name="location" autoFocus />
                      <XCircleIcon
                        className="absolute right-2 bottom-2 size-5 transform"
                        role="button"
                        onClick={() => setLocationFreeForm(false)}
                      />
                    </>
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-7 sm:gap-2">
                  <Field className="sm:col-span-3">
                    <Label>Day</Label>
                    <Input
                      type="date"
                      name="start_date"
                      defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <Label>Time</Label>
                    <Input type="time" name="start_time" defaultValue="10:00" />
                  </Field>
                </div>
              </FieldGroup>
            </Fieldset>
          </DialogBody>
          <DialogActions>
            {status !== 'Close' && (
              <Button plain onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit">{status}</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* ... */}
    </>
  )
}
