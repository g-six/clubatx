'use client'
import { Badge } from '@/components/badge'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Label } from '@/components/fieldset'
import { Switch } from '@/components/switch'
import { postRequest } from '@/lib/helpers/api'
import { getFormattedTime, getLocalDateFromDateAndTime } from '@/lib/helpers/datetime'
import { filterAthletes } from '@/lib/models/athlete'
import { getDaysHoursMinutesBeforeKickoff, useTeamEvents } from '@/lib/models/event/store'
import { CalendarEvent } from '@/lib/models/event/types'
import { filterManyInvitees, inviteAthletes, updateInvitees } from '@/lib/models/invitee'
import { Invitee } from '@/lib/models/invitee/types'
import { Athlete } from '@/lib/types/athlete.types'
import UserContext from '@/lib/user-context'
import { Field } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import { useContext, useState } from 'react'
import { CreateItemDialog } from './create'
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

  console.log(ctx.user?.teams)
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
        </div> */}
      {ctx.user?.teams?.find((t) => ['MANAGER', 'COACH', 'ADMIN'].includes(t.role.toUpperCase())) && (
        <div className="flex w-full flex-wrap justify-end gap-4">
          <CreateItemDialog />
        </div>
      )}
      <div className="mt-10 flex flex-col gap-4 divide-y divide-zinc-800">
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
            <div key={item.slug} className="pb-6">
              <div className="flex justify-between max-sm:flex-col max-sm:items-center max-sm:justify-start">
                <div className="flex gap-6 max-sm:w-full max-sm:py-6">
                  <div className="space-y-1.5">
                    <div className="font-semibold capitalize max-sm:text-2xl/8 sm:text-base/6">
                      {item.event_type.toLowerCase()}
                    </div>
                    <div className="sm:text-xs/6 sm:text-zinc-500">
                      <span>{item.location}</span>
                      <span aria-hidden="true" className="max-sm:hidden">
                        {' • '}
                      </span>
                      <br aria-hidden="true" className="sm:hidden" />
                      {getFormattedTime(item.start_date, item.start_time)}
                      <span aria-hidden="true">{' • '}</span>
                      {humanizeDuration(item.duration)}
                      <span aria-hidden="true">{' • '}</span>
                      {
                        getDaysHoursMinutesBeforeKickoff(getLocalDateFromDateAndTime(item.start_date, item.start_time))
                          .best
                      }
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-2 sm:w-1/3 sm:items-end">
                  <div className="flex gap-4 max-sm:w-full max-sm:justify-between sm:items-center">
                    <Badge className="capitalize" color={item.event_type === 'training' ? 'zinc' : 'lime'}>
                      {item.team}
                    </Badge>
                    {item.opponent && (
                      <Badge className="capitalize" color={item.event_type === 'training' ? 'zinc' : 'rose'}>
                        {item.opponent}
                      </Badge>
                    )}
                    {ctx.user?.teams?.find(
                      (t) => ['MANAGER', 'COACH', 'ADMIN'].includes(t.role.toUpperCase()) && t.name === item.team
                    ) ? (
                      <Dropdown>
                        <DropdownButton plain aria-label="More options">
                          <EllipsisVerticalIcon />
                        </DropdownButton>
                        <DropdownMenu anchor="bottom end">
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
                        </DropdownMenu>
                      </Dropdown>
                    ) : (
                      <></>
                    )}
                  </div>
                  {ctx.user?.teams?.find(
                    (t) => ['PARENT', 'ADMIN', 'MANAGER'].includes(t.role.toUpperCase()) && t.name === item.team
                  ) ? (
                    <div
                      data-invitees={item.invitees?.map((inv) => inv.invitee?.first_name).join(', ')}
                      className={
                        item.invitees?.length
                          ? 'flex flex-col gap-2 max-sm:w-full sm:items-end sm:justify-end'
                          : 'hidden'
                      }
                    >
                      {item.invitees
                        ?.sort((a, b) => a.invitee?.first_name.localeCompare(b.invitee?.first_name || '') || 0)
                        .map((record, idx) => (
                          <div key={record.invitee?.slug || record.athlete} className="sm:shrink">
                            <Field className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">
                              <Label className="text-xs max-sm:flex-1">
                                {record.invitee?.first_name}{' '}
                                {record.status === 'PENDING'
                                  ? '(Pending)'
                                  : record.status === 'GOING' &&
                                      getLocalDateFromDateAndTime(item.start_date, item.start_time) > new Date()
                                    ? 'is going'
                                    : record.status === 'NOT_GOING' &&
                                        getLocalDateFromDateAndTime(item.start_date, item.start_time) > new Date()
                                      ? 'is not going'
                                      : record.status === 'ATTENDED'
                                        ? 'attended'
                                        : record.status === 'ABSENT'
                                          ? 'was absent'
                                          : ''}
                              </Label>
                              <Switch
                                color={
                                  getLocalDateFromDateAndTime(item.start_date, item.start_time) < new Date()
                                    ? 'zinc'
                                    : 'lime'
                                }
                                disabled={getLocalDateFromDateAndTime(item.start_date, item.start_time) < new Date()}
                                defaultChecked={['ATTENDED', 'GOING'].includes(record.status)}
                                onChange={(checked) => {
                                  const athletes = [record.invitee?.slug || record.athlete]
                                  const event = item.slug

                                  updateInvitees(event, athletes, {
                                    status: checked ? 'GOING' : 'NOT_GOING',
                                  })
                                }}
                              />
                            </Field>
                          </div>
                          // <Badge
                          //   key={record.invitee?.slug || record.athlete}
                          //   color={record.status === 'PENDING' ? 'lime' : 'zinc'}
                          //   className="cursor-pointer"
                          // >
                          //   {record.invitee?.first_name}
                          //   <ChevronDownIcon className="inline size-4" />
                          // </Badge>
                        ))}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      <InviteComponent isOpen={invite} toggleOpen={toggleInvite} handleSubmit={handleSubmit} />
      {inviteEvent && Boolean(inviteEvent) && (
        <NotifyComponent
          data-call-to-action={notify}
          toggleOpen={toggleNotifier}
          data-event={inviteEvent as unknown as Record<string, string>}
          data-items={
            (inviteEvent?.invitees
              .map((i) => ({
                ...i.invitee,
                slug: i.athlete || i.invitee?.slug,
              }))
              .filter(Boolean) as unknown as Record<string, string>[]) || []
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
