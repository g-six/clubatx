'use client'
import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
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
import { VideoCameraIcon } from '@heroicons/react/24/solid'
import { decode } from 'jsonwebtoken'
import { FormEvent, useEffect, useState } from 'react'
import { Select } from './select'

export function BookDialog() {
  const locations = useLocations() || []
  const [locationFreeForm, setLocationFreeForm] = useState(false)
  const [status, setStatus] = useState('Create')
  const [teamKeyword, setTeamKeyword] = useState('')
  const [email, setEmail] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [user, setUser] = useState<Record<string, any> | null>(null)

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

  // Check session
  useEffect(() => {
    if (localStorage.getItem('token')) {
      try {
        const payload = decode(localStorage.getItem('token')!) as any
        if (payload.username) {
          const { username, id, first_name, last_name, ...rest } = payload
          setEmail(username)
          setUser({
            username,
            id,
            first_name,
            last_name,
            email: username,
          })
        }
      } finally {
        console.log('Session check complete')
      }
    }
  }, [])

  const resetFormAndClose = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setStatus('Create')
    setTeamKeyword('')
    setTeams([])
    setLocationFreeForm(false)
    setIsOpen(false)
  }
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

    if (!team || !start_date) {
      setStatus('Please enter team name')
      return
    }
    try {
      setStatus('Creating...')
      data.phone = data.phone || ''
      const result = await signUp({
        ...data,
        ...user,
      })
      if (result?.session) {
        const booking = await supabase
          .from('bookings')
          .insert({
            booked_by: user?.email || data.email,
            team,
            location: data.location,
            start_date,
            start_time,
          })
          .select()
          .single()
        if (booking?.data) {
          const email = await postRequest('/api/email', {
            TemplateAlias: 'booking-confirmation',
            TemplateModel: {
              action_url: `${location.href.split('/').slice(0, 3).join('/')}/login?code=${result.session.code}&booking=${booking.data.id}`,
              name: user?.first_name || data.first_name,
            },
            To: booking.data.booked_by,
          })

          if (email?.Message === 'OK') {
            alert('Booking created! Please check your email for login details.')
            form.reset()
            setStatus('Close')
            setIsOpen(false)
          }
        }
      } else {
        setStatus('Email is required')
      }
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      // setStatus('Save')
    }
  }
  return (
    <>
      <Button color="rose" className="mt-4 w-full py-2! text-xl! max-sm:hidden" onClick={() => setIsOpen(true)}>
        Book now
      </Button>
      <button
        type="button"
        className="mx-1.5 my-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-lime-500 to-green-500 text-white shadow-lg sm:hidden"
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <VideoCameraIcon className="size-8" />
      </button>
      <Dialog open={isOpen} onClose={setIsOpen} size="md">
        <form action="" method="POST" onSubmit={handleSubmit} ref={(el) => el?.reset()}>
          <DialogTitle>Book a recording</DialogTitle>
          <DialogDescription>Please fill in the details for the new recording.</DialogDescription>
          <DialogBody>
            {/* ... */}
            <Fieldset>
              <FieldGroup>
                {!Boolean(user?.username) && (
                  <>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-2">
                      <Field className="sm:col-span-2">
                        <Label>Email</Label>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          name="email"
                          autoFocus
                          disabled={Boolean(user?.username)}
                        />
                      </Field>

                      <Field>
                        <Label>Phone</Label>
                        <Input name="phone" type="tel" defaultValue={user?.phone} />
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
                  </>
                )}
                <Field>
                  <Label>Team name</Label>
                  <Input
                    name="team"
                    invalid={status.startsWith('Please ') && status.includes('team')}
                    value={teamKeyword}
                    placeholder={user?.username ? 'Start typing to search...' : 'Enter team name'}
                    onChange={(evt) => {
                      setTeamKeyword(evt.target.value)
                    }}
                  />
                  {status.startsWith('Please ') && status.includes('team') && <ErrorMessage>{status}</ErrorMessage>}
                  <div className="relative w-full">
                    <div className="backdrop-blur-2xl/50 absolute top-1 z-10 max-h-40 w-full rounded-xl bg-black">
                      {teams
                        .filter((team) => {
                          if (teamKeyword.length >= 2) {
                            return (
                              !teams.find((t) => t.name.toLowerCase() === teamKeyword.toLowerCase()) &&
                              team.name.toLowerCase().includes(teamKeyword.toLowerCase())
                            )
                          }
                          return teamKeyword.length === 0
                        })
                        .slice(0, 3)
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
              <Button
                plain
                onClick={(e) => {
                  setStatus('Create')
                  setIsOpen(false)
                }}
                type="reset"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" color={status.startsWith('Please ') ? 'red' : 'rose'}>
              {status}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* ... */}
    </>
  )
}
