'use client'
import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Input, InputGroup } from '@/components/input'
import { Link } from '@/components/link'
import { Select } from '@/components/select'
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { CreateItemDialog } from './create'

const clients = [
  {
    id: 1,
    name: 'Tuple',
    imageUrl: 'https://tailwindcss.com/plus-assets/img/logos/48x48/tuple.svg',
    lastInvoice: { date: 'December 13, 2022', dateTime: '2022-12-13', amount: '$2,000.00', status: 'Overdue' },
  },
  {
    id: 2,
    name: 'SavvyCal',
    imageUrl: 'https://tailwindcss.com/plus-assets/img/logos/48x48/savvycal.svg',
    lastInvoice: { date: 'January 22, 2023', dateTime: '2023-01-22', amount: '$14,000.00', status: 'Paid' },
  },
  {
    id: 3,
    name: 'Reform',
    imageUrl: 'https://tailwindcss.com/plus-assets/img/logos/48x48/reform.svg',
    lastInvoice: { date: 'January 23, 2023', dateTime: '2023-01-23', amount: '$7,600.00', status: 'Paid' },
  },
]

export default function EventsPageClientComponent({ 'data-events': events }: { 'data-events': Record<string, any>[] }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search events&hellip;" />
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
        <CreateItemDialog />
      </div>
      <ul className="mt-10">
        {events.map((event, index) => (
          <li key={event.id}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between">
              <div key={event.id} className="flex gap-6 py-6">
                <div className="w-32 shrink-0">
                  <Link href={event.url} aria-hidden="true">
                    <img className="aspect-3/2 rounded-lg shadow-sm" src={event.imgUrl} alt="" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <Link href={event.url}>{event.name}</Link>
                  </div>
                  <div className="text-xs/6 text-zinc-500">
                    {event.date} at {event.time} <span aria-hidden="true">·</span> {event.location}
                  </div>
                  <div className="text-xs/6 text-zinc-600">
                    {event.ticketsSold}/{event.ticketsAvailable} tickets sold
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="max-sm:hidden" color={event.status === 'On Sale' ? 'lime' : 'zinc'}>
                  {event.status}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem href={event.url}>View</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
