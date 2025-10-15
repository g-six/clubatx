'use client'
import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Link } from '@/components/link'
import { postRequest } from '@/lib/helpers/api'
import { filterAthletes } from '@/lib/models/athlete'
import { getDaysHoursMinutesBeforeKickoff, useTeamEvents } from '@/lib/models/event/store'
import { CalendarEvent } from '@/lib/models/event/types'
import { filterManyInvitees, inviteAthletes } from '@/lib/models/invitee'
import { Invitee } from '@/lib/models/invitee/types'
import { Athlete } from '@/lib/types/athlete.types'
import UserContext from '@/lib/user-context'
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import { useContext, useState } from 'react'
import { InviteComponent } from './invite-component'
import { NotifyComponent } from './notify-component'

export default function EventsPageClientComponent() {
  const ctx = useContext(UserContext)
  const { setRecords: setTeamEvents } = useTeamEvents()
  const [invite, toggleInvite] = useState(false)
  const [notify, toggleNotifier] = useState('')
  const [inviteEvent, setInviteEvent] = useState<CalendarEvent & { invitees: (Invitee & { athlete: Athlete })[] }>()

  function handleSubmit(selected: string[]) {
    if (inviteEvent && selected.length) {
      inviteAthletes(
        selected.map((athlete) => ({
          athlete,
          event: inviteEvent.slug,
          status: 'PENDING',
        })),
        ctx.user?.id || ''
      ).then((newRecords) => {
        filterAthletes(selected.map((s) => `${s}%`)).then(() => {
          if (newRecords)
            setTeamEvents((prev) => {
              const evt = prev.find((e) => e.slug === inviteEvent.slug)
              if (!evt) return prev
              return [
                ...prev.filter((e) => e.slug !== inviteEvent.slug),
                {
                  ...evt,
                  invitees: [...evt.invitees, ...newRecords],
                },
              ]
            })
        })
      })
    }
    toggleInvite(false)
  }
  return (
    <>
      {/* <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search&hellip;" />
              </InputGroup>
            </div>
            <div>
              <Select name="sort_by">
                <option value="name">Sort by name</option>
                <option value="date">Sort by date</option>
                <option value="status">Sort by status</option>
              </Select>
            </div>
          </div>
        </div>
        {ctx.user?.teams?.find((t) => ['MANAGER', 'COACH', 'ADMIN'].includes(t.role.toUpperCase())) && (
          <CreateItemDialog />
        )}
      </div> */}
      <ul className="mt-10">
        {(ctx.user?.calendar || [])
          .filter((item) => {
            let shouldInclude = Boolean(item.slug)
            if (shouldInclude) {
              const team = ctx.user?.teams?.find((t) => t.name === item.team)
              if (team?.role === 'parent') {
                if (team.roster && item.invitees?.length) {
                  const athletes = item.invitees.filter((inv) =>
                    team.roster.map((tr) => tr.athlete || tr.slug).includes(inv.athlete)
                  )
                  shouldInclude = athletes.length > 0
                } else shouldInclude = false
              }
            }

            return shouldInclude
          })
          .map((item, index) => (
            <li key={item.slug}>
              <Divider soft={index > 0} />
              <div className="flex items-center justify-between">
                <div className="flex gap-6 py-6">
                  <div className="space-y-1.5">
                    <div className="text-base/6 font-semibold">
                      <Link href={`/events/${item.slug}`} className="capitalize">
                        {item.event_type}
                      </Link>
                    </div>
                    <div className="text-xs/6 text-zinc-500">
                      {item.location}
                      <span aria-hidden="true">{' • '}</span>
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                        new Date(`${item.start_date} ${item.start_time}:00`)
                      )}
                      {' • '}
                      {humanizeDuration(item.duration)}
                      {' • '}
                      {getDaysHoursMinutesBeforeKickoff(new Date(`${item.start_date} ${item.start_time}:00`)).best}
                    </div>
                    <div className={item.invitees?.length ? 'flex flex-wrap gap-1' : 'hidden'}>
                      {item.invitees?.map((record) => (
                        <Badge
                          key={record.invitee?.slug || record.athlete}
                          color={record.status === 'PENDING' ? 'lime' : 'zinc'}
                        >
                          {record.invitee?.first_name}{' '}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className="capitalize max-sm:hidden" color={item.event_type === 'training' ? 'zinc' : 'lime'}>
                    {item.team}
                  </Badge>
                  <Dropdown>
                    <DropdownButton plain aria-label="More options">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      {ctx.user?.teams?.find(
                        (t) => ['MANAGER', 'COACH', 'ADMIN'].includes(t.role.toUpperCase()) && t.name === item.team
                      ) ? (
                        <>
                          <DropdownItem
                            onClick={() => {
                              toggleNotifier('Send a text reminder')
                              setInviteEvent(item as typeof inviteEvent)
                            }}
                          >
                            Notify
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              toggleInvite(true)
                              setInviteEvent(item as typeof inviteEvent)
                            }}
                          >
                            Invite
                          </DropdownItem>
                        </>
                      ) : (
                        <></>
                      )}
                      <DropdownItem
                        onClick={() => {
                          toggleInvite(true)
                          setInviteEvent(item as typeof inviteEvent)
                        }}
                      >
                        Going
                      </DropdownItem>
                      <DropdownItem onClick={() => {}}>Not Going</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </li>
          ))}
      </ul>
      <InviteComponent isOpen={invite} toggleOpen={toggleInvite} handleSubmit={handleSubmit} />
      {inviteEvent && Boolean(inviteEvent) && (
        <NotifyComponent
          data-call-to-action={notify}
          toggleOpen={toggleNotifier}
          data-event={inviteEvent as unknown as Record<string, string>}
          data-items={
            (inviteEvent?.invitees.map((i) => i.invitee).filter(Boolean) as unknown as Record<string, string>[]) || []
          }
          handleSubmit={(selected, message) => {
            filterManyInvitees(selected, inviteEvent.slug).then((inv) => {
              const athletes = inv
                ?.map((i) => ({
                  phone: i.athlete.phone,
                  name: i.athlete.first_name,
                }))
                .filter(Boolean)
              postRequest('/api/notify', { athletes, message }).then(() => {
                toggleNotifier('Done! Text messages are on their way.')
                setTimeout(() => toggleNotifier(''), 3000)
              })
            })
          }}
        />
      )}
    </>
  )
}

function humanizeDuration(minutes: number) {
  if (minutes < 60) return minutes
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs} hr${hrs > 1 ? 's' : ''}${mins > 0 ? ` ${mins} min${mins > 1 ? 's' : ''}` : ''}`
}
