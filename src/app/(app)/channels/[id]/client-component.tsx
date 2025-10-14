// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
'use client'
import { Button } from '@/components/button'
import { Subheading } from '@/components/heading'
import { addMessage, Message, useStore } from '@/lib/store'
import UserContext from '@/lib/user-context'
import {
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'

const activity = [
  { id: 1, type: 'created', person: { name: 'Chelsea Hagon' }, date: '7d ago', dateTime: '2023-01-23T10:32' },
  { id: 2, type: 'edited', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:03' },
  { id: 3, type: 'sent', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:24' },
  {
    id: 4,
    type: 'commented',
    person: {
      name: 'Chelsea Hagon',
      imageUrl:
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
    date: '3d ago',
    dateTime: '2023-01-23T15:56',
  },
  { id: 5, type: 'viewed', person: { name: 'Alex Curren' }, date: '2d ago', dateTime: '2023-01-24T09:12' },
  { id: 6, type: 'paid', person: { name: 'Alex Curren' }, date: '1d ago', dateTime: '2023-01-24T09:20' },
]

const moods = [
  { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
  { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
  { name: 'Happy', value: 'happy', icon: FaceSmileIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
  { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
  { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
  {
    name: 'I feel nothing',
    value: null,
    icon: XMarkIcon,
    iconColor: 'text-gray-400 dark:text-gray-500',
    bgColor: 'bg-transparent',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ChannelClientComponent(p: { 'data-id': string }) {
  const { user } = useContext(UserContext)
  const { messages, users } = useStore({ channelId: Number(p['data-id']) })
  const [selected, setSelected] = useState(moods[5])
  const messagesEndRef: RefObject<HTMLLIElement | null> = useRef(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    })
  }, [messages])
  // const orders = [] // await getEventOrders(id)
  return (
    <section {...p}>
      <Subheading className="mt-12">Recent messages</Subheading>

      <ul role="list" className="h-[calc(100vh-24rem)] space-y-6">
        {messages.map((item: Message, activityItemIdx) => {
          const user = users.get(item.user_id)
          return (
            <li key={item.id} className="relative flex gap-x-4">
              <div
                className={classNames(
                  activityItemIdx === messages.length - 1 ? 'h-6' : '-bottom-6',
                  'absolute top-0 left-0 flex w-6 justify-center'
                )}
              >
                <div className="w-px bg-gray-200 dark:bg-white/15" />
              </div>
              {item.type === 'commented' ? (
                <>
                  <img
                    alt=""
                    src={item.person?.imageUrl}
                    className="relative mt-3 size-6 flex-none rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                  />
                  <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 ring-inset dark:ring-white/15">
                    <div className="flex justify-between gap-x-4">
                      <div className="py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{item.person.name}</span> commented
                      </div>
                      <time
                        dateTime={item.dateTime}
                        className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400"
                      >
                        {item.date}
                      </time>
                    </div>
                    <p className="text-sm/6 text-gray-500 dark:text-gray-400">{item.comment}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative flex size-6 flex-none items-center justify-center bg-white dark:bg-gray-900">
                    {item.type === 'paid' ? (
                      <CheckCircleIcon aria-hidden="true" className="size-6 text-teal-600 dark:text-teal-500" />
                    ) : (
                      <div className="size-1.5 rounded-full bg-gray-100 ring ring-gray-300 dark:bg-white/10 dark:ring-white/20" />
                    )}
                  </div>
                  <p className="flex-auto py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user?.first_name || user?.username || 'Unknown user'}
                    </span>{' '}
                    {item.message}
                  </p>
                  <time
                    dateTime={item.inserted_at}
                    className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400"
                  >
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    }).format(new Date(item.inserted_at))}
                  </time>
                </>
              )}
            </li>
          )
        })}
        <li ref={messagesEndRef} style={{ height: 0 }} />
      </ul>

      {/* New comment form */}
      <div className="mt-6 flex gap-x-3">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          className="size-6 flex-none rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
        />
        <form action="#" className="relative flex-auto">
          <div className="overflow-hidden rounded-lg pb-12 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-teal-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-teal-500">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={2}
              placeholder="Add your comment..."
              className="block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
              defaultValue={''}
              onKeyDown={(e) => {
                if (e.metaKey && e.key === 'Enter') {
                  if (user?.id) {
                    addMessage(e.currentTarget.value, Number(p['data-id']), user.id)
                    e.currentTarget.value = ''
                  }
                }
              }}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3">
            <div className="flex items-center space-x-5">
              <div className="flex items-center">
                <button
                  type="button"
                  className="-m-2.5 flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white"
                >
                  <PaperClipIcon aria-hidden="true" className="size-5" />
                  <span className="sr-only">Attach a file</span>
                </button>
              </div>
              <div className="flex items-center"></div>
            </div>
            <Button type="submit" color="teal">
              Send
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
