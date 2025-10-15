'use client'
import { Avatar } from '@/components/avatar'
import { Dropdown, DropdownButton, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { useApp } from '@/lib/models/session/store'
import { supabase } from '@/lib/store'
import UserContext from '@/lib/user-context'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
} from '@heroicons/react/16/solid'
import { Cog6ToothIcon, HomeIcon, MapPinIcon, Square2StackIcon } from '@heroicons/react/20/solid'
import { Session } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      {/* <DropdownItem href="#">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider /> */}
      <DropdownItem href="/login">
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export function ApplicationLayout({ children, ...props }: { children: React.ReactNode }) {
  const { 'data-token': token } = props as Record<string, string>
  const user = useApp({ token })

  let pathname = usePathname()
  const [authLoaded, setUserLoaded] = useState<boolean>(false)

  const [s, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    function saveSession(
      /** @type {Awaited<ReturnType<typeof supabase.auth.`getSession>>['data']['session']} */
      session: Session
    ) {
      setSession(session)
      const currentUser: any = session?.user

      setUserLoaded(!!currentUser)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      return session && saveSession(session)
    })

    return () => {}
  }, [])

  const signOut = async () => {
    localStorage.clear()
  }
  return user?.id ? (
    <UserContext.Provider
      value={{
        authLoaded,
        user,
        signOut,
        token,
      }}
    >
      <SidebarLayout
        navbar={
          <Navbar>
            <NavbarSpacer />
            <NavbarSection>
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar
                    src="https://viplaril6wogm0dr.public.blob.vercel-storage.com/clubathletix/logos/logo.png"
                    square
                  />
                </DropdownButton>
                <AccountDropdownMenu anchor="bottom end" />
              </Dropdown>
            </NavbarSection>
          </Navbar>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <Dropdown>
                <DropdownButton as={SidebarItem}>
                  <Avatar src="https://viplaril6wogm0dr.public.blob.vercel-storage.com/clubathletix/logos/logo-xl.png" />
                  <SidebarLabel>ClubAthletix</SidebarLabel>
                  <ChevronDownIcon />
                </DropdownButton>
                {/* <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                  <DropdownItem href="/settings">
                    <Cog8ToothIcon />
                    <DropdownLabel>Settings</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="#">
                    <Avatar
                      slot="icon"
                      src="https://viplaril6wogm0dr.public.blob.vercel-storage.com/clubathletix/logos/logo-xl.png"
                    />
                    <DropdownLabel>Catalyst</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="#">
                    <Avatar slot="icon" initials="BE" className="bg-purple-500 text-white" />
                    <DropdownLabel>Big Events</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="#">
                    <PlusIcon />
                    <DropdownLabel>New team&hellip;</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu> */}
              </Dropdown>
            </SidebarHeader>

            <SidebarBody>
              <SidebarSection>
                <SidebarItem href="/dash" current={pathname === '/dash'}>
                  <HomeIcon />
                  <SidebarLabel>Home</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/events" current={pathname.startsWith('/events')}>
                  <Square2StackIcon />
                  <SidebarLabel>Events</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/recordings" current={pathname.startsWith('/recordings')}>
                  <VideoCameraIcon />
                  <SidebarLabel>Recordings</SidebarLabel>
                </SidebarItem>
                {user?.roles?.map((r) => r.toUpperCase()).includes('ADMIN') && (
                  <>
                    <SidebarItem href="/teams" current={pathname.startsWith('/teams')}>
                      <ShieldCheckIcon />
                      <SidebarLabel>Teams</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/locations" current={pathname.startsWith('/location')}>
                      <MapPinIcon />
                      <SidebarLabel>Locations</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                      <Cog6ToothIcon />
                      <SidebarLabel>Settings</SidebarLabel>
                    </SidebarItem>
                  </>
                )}
              </SidebarSection>

              {/* <SidebarSection className="max-lg:hidden">
                <SidebarHeading>Upcoming Events</SidebarHeading>

                <SidebarItem>sidebar</SidebarItem>
              </SidebarSection> */}

              {/* <SidebarSpacer />

              <SidebarSection>
                <SidebarItem href="#">
                  <QuestionMarkCircleIcon />
                  <SidebarLabel>Support</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#">
                  <SparklesIcon />
                  <SidebarLabel>Changelog</SidebarLabel>
                </SidebarItem>
              </SidebarSection> */}
            </SidebarBody>

            <SidebarFooter className="max-lg:hidden">
              <Dropdown>
                <DropdownButton as={SidebarItem}>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src="https://viplaril6wogm0dr.public.blob.vercel-storage.com/clubathletix/logos/logo.png"
                      className="size-10"
                      square
                      alt=""
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                        {[user?.first_name, user?.last_name].filter(Boolean).join(' ')}
                      </span>
                      <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                        {user?.username}
                      </span>
                    </span>
                  </span>
                  <ChevronUpIcon />
                </DropdownButton>
                <AccountDropdownMenu anchor="top start" />
              </Dropdown>
            </SidebarFooter>
          </Sidebar>
        }
      >
        {children}
      </SidebarLayout>
    </UserContext.Provider>
  ) : (
    <></>
  )
}
