'use client'
import { Badge } from '@/components/badge'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Input, InputGroup } from '@/components/input'
import { Link } from '@/components/link'
import TeamGrid from '@/components/teams/card'
import { CreateTeamDialog } from '@/components/teams/create'
import { filterLocations } from '@/lib/models/location'
import { useTeams } from '@/lib/models/team/store'
import { Team } from '@/lib/models/team/types'
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'

function getBadgeColor(
  keyword: string
):
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'zinc' {
  switch (keyword) {
    case 'TURF':
      return 'violet'
    case 'GRASS':
      return 'green'
    case 'INDOOR TURF':
      return 'purple'
    case 'GYM':
      return 'orange'
    case 'FUTSAL':
      return 'cyan'
    default:
      return 'zinc'
  }
}
export default function TeamsPageClientComponent() {
  const teams = useTeams()

  const [records, setRecords] = useState<Team[]>([])
  const [sort, sortBy] = useState<string>('name')
  const [loading, setLoading] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState<Promise<any>>()

  useEffect(() => {
    let handler: NodeJS.Timeout
    if (search) {
      handler = setTimeout(() => setDebouncedSearch(filterLocations(search)), 300)
    }
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    if (debouncedSearch)
      debouncedSearch.then((results) => {
        setRecords(results || [])
      })
  }, [debouncedSearch])
  useEffect(() => {
    setRecords(teams as unknown as Team[])
  }, [teams])

  // Optionally, filter locations here using debouncedSearch
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input
                  name="search"
                  placeholder="Search teams&hellip;"
                  onChange={(e) => {
                    setLoading(true)
                    setDebouncedSearch(undefined)
                    setSearch(`${e.currentTarget.value}%`)
                  }}
                />
              </InputGroup>
            </div>
            {/* <div>
              <Select name="sort_by" onChange={(e) => sortBy(e.currentTarget.value)}>
                <option value="name">Sort by name</option>
                <option value="location_type">Sort by type</option>
                <option value="city_town">Sort by city</option>
              </Select>
            </div> */}
          </div>
        </div>
        <div className="max-sm:hidden">
          <CreateTeamDialog />
        </div>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TeamGrid
          items={teams.sort((a: any, b: any) => {
            if (a[sort] < b[sort]) return -1
            if (a[sort] > b[sort]) return 1
            return 0
          })}
        />
        {teams
          .sort((a: any, b: any) => {
            if (a[sort] < b[sort]) return -1
            if (a[sort] > b[sort]) return 1
            return 0
          })
          .map((item, index) => (
            <div key={item.name} className="rounded-xl bg-black/5 py-4 dark:bg-black">
              <div className="flex items-start justify-between">
                <div className="flex w-5/6 gap-6 lg:w-3/4">
                  <div className="text-overflow-ellipsis w-full space-y-1.5 overflow-hidden py-1 pl-6 text-ellipsis">
                    <div className="w-full overflow-hidden text-sm/6 font-semibold text-ellipsis whitespace-nowrap">
                      <Link href={`/team/${item.name}`}>{item.name}</Link>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {item?.members && `${item.members.length} member${item.members.length !== 1 ? 's' : ''}`}
                      {item.administrator?.username && <span>Created by {item.administrator.username}</span>}
                      <br />
                      {/* {[item.city_town, [item.state_province, item.postal_zip_code].filter(Boolean).join(' ')]
                        .filter(Boolean)
                        .join(', ')} */}
                    </div>
                  </div>
                </div>
                <div className="flex w-1/6 items-center justify-end lg:w-1/4">
                  <Badge className="max-sm:hidden">
                    {item.short_name ||
                      item.name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word.charAt(0).toUpperCase())
                        .join('')}
                  </Badge>
                  <Dropdown>
                    <DropdownButton plain aria-label="More options" className="mx-4">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem href={`/team/${item.name}`}>View</DropdownItem>
                      <DropdownItem>Edit</DropdownItem>
                      <DropdownItem>Book</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
