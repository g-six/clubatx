'use client'
import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/dialog'
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { parseForm } from '@/lib/form'

import { Heading } from '@/components/heading'
import { filterTeams } from '@/lib/models/team'
import { Team } from '@/lib/models/team/types'
import { supabase } from '@/lib/store'
import { UserGroupIcon } from '@heroicons/react/24/solid'
import { decode } from 'jsonwebtoken'
import { FormEvent, useEffect, useState } from 'react'

export function CreateTeamDialog() {
  const [status, setStatus] = useState('Create')
  const [teamKeyword, setTeamKeyword] = useState('')
  const [filteredTeams, setTeams] = useState<Team[]>([])
  const [user, setUser] = useState<Record<string, any> | null>(null)
  // Debounce teamKeyword updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (teamKeyword.trim().length >= 3) {
        filterTeams(`${teamKeyword.trim()}%`, setTeams)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [teamKeyword])

  let [isOpen, setIsOpen] = useState(false)

  // Check session
  useEffect(() => {
    if (localStorage.getItem('token')) {
      try {
        const payload = decode(localStorage.getItem('token')!) as any
        if (payload.id) {
          const { id, first_name, last_name, username } = payload
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const { team, short_name } = parseForm(form) as unknown as {
      team: string
      short_name: string
    }

    if (!team) {
      setStatus('Please enter team name')
      return
    }
    try {
      setStatus('Creating...')
      if (user?.id) {
        const { data } = await supabase
          .from('teams')
          .insert({
            created_by: user.id,
            name: team,
            short_name,
          })
          .select()
          .single()
        if (data) {
          form.reset()
          setStatus('Close')
          setIsOpen(false)
        }
      } else {
        setStatus('Team name is required')
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
        Create a team
      </Button>
      <button
        type="button"
        className="mx-1.5 my-3 flex size-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-tr from-red-500 to-rose-500 text-white shadow-lg sm:hidden"
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <Heading className="mt-1 text-[0.55rem]/2! font-bold! text-white! uppercase">Teams</Heading>
        <UserGroupIcon className="size-8" />
      </button>
      <Dialog open={isOpen} onClose={setIsOpen} size="md">
        <form action="" method="POST" onSubmit={handleSubmit} ref={(el) => el?.reset()}>
          <DialogTitle>Add new team</DialogTitle>
          <DialogBody>
            {/* ... */}
            <Fieldset>
              <FieldGroup>
                <Field>
                  <Label>Team name</Label>
                  <Input
                    name="team"
                    invalid={status.startsWith('Please ') && status.includes('team')}
                    value={teamKeyword}
                    placeholder="Enter team name"
                    onChange={(evt) => {
                      setTeamKeyword(evt.target.value)
                    }}
                  />
                  {status.startsWith('Please ') && status.includes('team') && <ErrorMessage>{status}</ErrorMessage>}
                  {/* <div className="relative w-full">
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
                  </div> */}
                </Field>
                <Field>
                  <Label>Short name (e.g. AFC)</Label>
                  <Input name="short_name" placeholder="Enter short name" />
                </Field>
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
