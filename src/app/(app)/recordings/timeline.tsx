import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { getFormattedTime } from '@/lib/helpers/datetime'
import { getDaysHoursMinutesAfterKickoff } from '@/lib/models/event/store'
import UserContext from '@/lib/user-context'
import { CheckBadgeIcon, DocumentCurrencyDollarIcon } from '@heroicons/react/16/solid'
import { ChatBubbleLeftEllipsisIcon, TagIcon, VideoCameraIcon } from '@heroicons/react/20/solid'
import { Fragment, useContext } from 'react'
import { ViewDialog } from './player'

const defaultItems: any[] = [
  {
    slug: 'dc706c2f8d05647d8742a6d25660f2ab',
    id: 1,
    status: 'AVAILABLE',
    name: 'Eduardo Benz',
    person: { name: 'Eduardo Benz', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.',
    date: '6d ago',
  },
  {
    id: 2,

    slug: 'a20712649e1f04a37bc38da53cd219ee',
    status: 'PENDING',
    name: 'Hilary Mahy',
    person: { name: 'Hilary Mahy', href: '#' },
    assigned: { name: 'Kristin Watson', href: '#' },
    date: '2d ago',
  },
  {
    slug: 'e68c8465bb830973d60db71db2691340',
    id: 3,
    status: 'tags',
    name: 'Hilary Mahy',
    person: { name: 'Hilary Mahy', href: '#' },
    tags: [
      { name: 'Bug', href: '#', color: 'fill-red-500' },
      { name: 'Accessibility', href: '#', color: 'fill-indigo-500' },
    ],
    date: '6h ago',
  },
  {
    slug: '7ec9dbcc814569074a7e66ede8605cb7',
    id: 4,
    status: 'comment',
    name: 'Hilary Mahy',
    person: { name: 'Jason Meyers', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    date: '2h ago',
  },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export default function TimelineComponent({ items = defaultItems }: { items?: typeof defaultItems }) {
  const ctx = useContext(UserContext)
  return (
    <div className="mt-6 flow-root">
      <ul role="list" className="-mb-8">
        {items
          .sort(
            (a: { event_date: string; event_time: string }, b: { event_date: string; event_time: string }) =>
              new Date(`${b.event_date} ${b.event_time}:00`).getTime() -
              new Date(`${a.event_date} ${a.event_time}:00`).getTime()
          )
          .map((item, itemIdx) => (
            <li key={item.id || item.slug}>
              <div className="relative pb-8">
                {itemIdx !== items.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-white/10"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  {item.status === 'comment' ? (
                    <>
                      <div className="relative">
                        <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 ring-8 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                          <VideoCameraIcon aria-hidden="true" className="size-5 text-zinc-500 dark:text-zinc-400" />
                        </div>

                        <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-white px-0.5 py-px dark:bg-zinc-900">
                          <ChatBubbleLeftEllipsisIcon aria-hidden="true" className="size-5 text-zinc-400" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <button type="button" className="font-medium text-zinc-900 dark:text-white">
                              {item.name}
                            </button>
                          </div>
                          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Commented {item.date}</p>
                        </div>
                        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                          <p>{item.comment}</p>
                        </div>
                      </div>
                    </>
                  ) : !item.status ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 ring-8 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                            <VideoCameraIcon aria-hidden="true" className="size-5 text-lime-500 dark:text-lime-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-wrap justify-between py-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <div>
                          <ViewDialog
                            name={[item.team, item.event_type?.toLowerCase()].join(' ')}
                            src={item.slug}
                            startTime={item.starts_at_second}
                          />
                          <div className="text-sm">
                            {[
                              item.location,
                              item.home_or_away?.toUpperCase().at(0) + item.home_or_away?.toLowerCase().slice(1),
                              [
                                item.home_or_away?.toUpperCase() === 'HOME'
                                  ? `${item.home} - ${item.away}`
                                  : `${item.away} - ${item.home}`,
                                item.home_or_away?.toUpperCase() === 'HOME'
                                  ? item.home > item.away
                                    ? '(W)'
                                    : item.home < item.away
                                      ? '(L)'
                                      : '(D)'
                                  : item.home < item.away
                                    ? '(W)'
                                    : item.home > item.away
                                      ? '(L)'
                                      : '(D)',
                              ].join(' '),
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </div>
                        </div>
                        <div>
                          {getDaysHoursMinutesAfterKickoff(new Date(`${item.event_date} ${item.event_time}:00`))?.best}
                        </div>
                      </div>
                    </>
                  ) : ['pending', 'paying', 'paid'].includes(item.status?.toLowerCase()) ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 ring-8 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                            <VideoCameraIcon aria-hidden="true" className="size-5 text-zinc-500 dark:text-zinc-400" />
                          </div>

                          <span className="absolute -right-1 -bottom-1">
                            {item.status?.toLowerCase() === 'paid' ? (
                              <CheckBadgeIcon
                                aria-hidden="true"
                                className="size-5 text-cyan-400"
                                title={item.status?.toLowerCase()}
                              />
                            ) : (
                              <DocumentCurrencyDollarIcon
                                aria-hidden="true"
                                className="size-5 text-rose-400"
                                title={item.status?.toLowerCase()}
                              />
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-wrap py-1.5">
                        <div className="flex-1 text-sm">
                          <div className="font-medium text-zinc-900 dark:text-white">Booked for {item.team}</div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">{item.location}</div>
                        </div>
                        <div className="text-sm">
                          <Badge
                            color={item.status?.toLowerCase() === 'paid' ? 'cyan' : 'yellow'}
                            className="max-sm:text-right max-sm:whitespace-pre-line!"
                          >
                            {getFormattedTime(item.event_date, item.event_time, '\n')}
                          </Badge>
                        </div>
                        {item.status?.toLowerCase() !== 'paid' && (
                          <div className="mt-2 flex w-full justify-end">
                            <div className="max-sm:w-full">
                              <Button
                                href={`https://pay.clubathletix.com/b/eVq3cv5lJ53dcyt9T9aAw05?${[
                                  `locked_prefilled_email=${ctx.user?.username}&client_reference_id=${item.id}`,
                                ].join('&')}`}
                                target="_blank"
                                rel="noreferrer"
                                color="indigo"
                                className="w-full"
                              >
                                Complete Payment
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : item.status === 'tags' ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 ring-8 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                            <TagIcon aria-hidden="true" className="size-5 text-zinc-500 dark:text-zinc-400" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-0">
                        <div className="text-sm/8 text-zinc-500 dark:text-zinc-400">
                          <span className="mr-0.5">
                            <a href={item.person.href} className="font-medium text-zinc-900 dark:text-white">
                              {item.person.name}
                            </a>{' '}
                            added tags
                          </span>{' '}
                          <span className="mr-0.5">
                            {item.tags?.map((tag: { name: string; href: string; color: string }) => (
                              <Fragment key={tag.name}>
                                <a
                                  href={tag.href}
                                  className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-zinc-900 inset-ring inset-ring-zinc-200 dark:bg-white/5 dark:text-zinc-100 dark:inset-ring-white/10"
                                >
                                  <svg
                                    viewBox="0 0 6 6"
                                    aria-hidden="true"
                                    className={classNames(tag.color, 'size-1.5')}
                                  >
                                    <circle r={3} cx={3} cy={3} />
                                  </svg>
                                  {tag.name}
                                </a>{' '}
                              </Fragment>
                            ))}
                          </span>
                          <span className="whitespace-nowrap">{item.date}</span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}
