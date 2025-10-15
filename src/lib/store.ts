'use client'
import { createClient, REALTIME_LISTEN_TYPES, SupabaseClient } from '@supabase/supabase-js'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { fetchLocations, Location } from './models/location'

export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type Channel = {
  id: number
  slug: string
  created_by: number
  [key: string]: any
}

type User = {
  id: number
  [key: string]: any
}

export type Message = {
  id: number
  user_id: number
  channel_id: number
  message: string
  inserted_at: string
  author?: User
  [key: string]: any
}

type UseStoreProps = {
  channelId: number
}

type UseStoreReturn = {
  messages: Message[]
  channels: Channel[]
  locations: Location[]
  users: Map<number, User>
}

/**
 * @param {number} channelId the currently selected Channel
 */
export const useStore = (props: UseStoreProps): UseStoreReturn => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [users] = useState<Map<number, User>>(new Map())
  const [newLocation, handleNewLocation] = useState<Location | null>(null)
  const [newMessage, handleNewMessage] = useState<Message | null>(null)
  const [newChannel, handleNewChannel] = useState<Channel | null>(null)
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState<User | null>(null)
  const [deletedChannel, handleDeletedChannel] = useState<Channel | null>(null)
  const [deletedMessage, handleDeletedMessage] = useState<Message | null>(null)
  const [deletedLocation, handleDeletedLocation] = useState<Location | null>(null)

  // Load initial data and set up listeners
  useEffect(() => {
    // Get Channels
    console.log('load channels')
    fetchChannels(setChannels)

    console.log('load locations')
    fetchLocations(setLocations)
    // Listen for new and deleted messages
    const messageListener = supabase
      .channel('public:messages')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: { new: Message }) => handleNewMessage(payload.new)
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload: { old: Message }) => handleDeletedMessage(payload.old)
      )
      .subscribe()
    // Listen for changes to our users
    const userListener = supabase
      .channel('public:users')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: '*', schema: 'public', table: 'users' },
        (payload: { new: User }) => handleNewOrUpdatedUser(payload.new)
      )
      .subscribe()
    // Listen for new and deleted channels
    const channelListener = supabase
      .channel('public:channels')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'channels' },
        (payload: { new: Channel }) => handleNewChannel(payload.new)
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'channels' },
        (payload: { old: Channel }) => handleDeletedChannel(payload.old)
      )
      .subscribe()

    // Listen for new and deleted locations
    const locationListener = supabase
      .channel('public:locations')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'INSERT', schema: 'public', table: 'locations' },
        (payload: { new: Location }) => handleNewLocation(payload.new)
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'UPDATE', schema: 'public', table: 'locations' },
        (payload: { new: Location; old: Location }) =>
          setLocations((prev) => [...prev.filter((p) => p.name !== payload.old.name), payload.new])
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as any,
        { event: 'DELETE', schema: 'public', table: 'locations' },
        (payload: { old: Location }) => handleDeletedLocation(payload.old)
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(messageListener)
      supabase.removeChannel(userListener)
      supabase.removeChannel(channelListener)
      supabase.removeChannel(locationListener)
    }
  }, [])

  // Update when the route changes
  useEffect(() => {
    if (props?.channelId > 0) {
      fetchMessages(props.channelId, (messages: Message[]) => {
        messages.filter((x) => x.author).forEach((x: Message) => users.set(x.user_id, x.author!))
        setMessages(messages)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.channelId])

  // New message received from Postgres
  useEffect(() => {
    if (newMessage && newMessage.channel_id === Number(props.channelId)) {
      const handleAsync = async () => {
        let authorId = newMessage.user_id
        if (!users.get(authorId)) await fetchUser(authorId, (user: User) => handleNewOrUpdatedUser(user))
        setMessages(messages.concat(newMessage))
      }
      handleAsync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage])

  // Deleted message received from postgres
  useEffect(() => {
    if (deletedMessage) setMessages(messages.filter((message) => message.id !== deletedMessage.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedMessage])

  // New channel received from Postgres
  useEffect(() => {
    if (newChannel) setChannels(channels.concat(newChannel))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newChannel])

  // Deleted channel received from postgres
  useEffect(() => {
    if (deletedChannel) setChannels(channels.filter((channel) => channel.id !== deletedChannel.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedChannel])

  // New channel received from Postgres
  useEffect(() => {
    if (newLocation) setLocations(locations.concat(newLocation))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newLocation])

  // Deleted location received from postgres
  useEffect(() => {
    if (deletedLocation) setLocations(locations.filter((item) => item.name !== deletedLocation.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedLocation])

  // New or updated user received from Postgres
  useEffect(() => {
    if (newOrUpdatedUser) users.set(newOrUpdatedUser.id, newOrUpdatedUser)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrUpdatedUser])

  return {
    // We can export computed values here to map the authors to each message
    messages: messages.map((x) => ({ ...x, author: users.get(x.user_id) })),
    locations,
    channels: channels !== null ? channels.sort((a, b) => a.slug.localeCompare(b.slug)) : [],
    users,
  }
}

/**
 * Fetch all channels
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchChannels = async (setState?: Dispatch<SetStateAction<Channel[]>>): Promise<Channel[] | undefined> => {
  try {
    let { data } = await supabase.from('channels').select('*')
    if (setState && data) setState(data)
    return data as Channel[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Update users.status
 * @param {string} id
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const updateUser = async (
  id: string,
  updates: Record<string, string | number | boolean | Date>,
  setState?: (user: User) => void
): Promise<User | undefined> => {
  try {
    let { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(`*, roles:user_roles(role)`)
      .single()
    let user = {
      ...data,
      roles: data.roles?.map((r: Record<string, any>) => r.role) as string[],
    }
    if (setState && user) setState(user)
    return user as User
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch a single user
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUser = async (userId: number, setState?: (user: User) => void): Promise<User | undefined> => {
  try {
    let { data } = await supabase.from('users').select(`*, roles:user_roles(role)`).eq('id', userId)
    let user = data && data[0]
    if (setState && user) setState(user)
    return user as User
  } catch (error) {
    console.log('error', error)
  }
}
/**
 * Fetch a single user by uuid
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUserByUuid = async (
  id: string,
  setState?: (user: Record<string, any>) => void
): Promise<Record<string, any> | undefined> => {
  try {
    let { data } = await supabase.from('users').select(`*, roles:user_roles(role)`).eq('id', id).single()
    let user = data && data[0]
    if (setState && user) setState(user)
    return user as Record<string, any>
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all messages and their authors
 * @param {number} channelId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchMessages = async (
  channelId: number,
  setState?: (messages: Message[]) => void
): Promise<Message[] | undefined> => {
  try {
    let { data } = await supabase
      .from('messages')
      .select(`*, author:user_id(*)`)
      .eq('channel_id', channelId)
      .order('inserted_at', { ascending: true })
    if (setState && data) setState(data as Message[])
    return data as Message[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Insert a new channel into the DB
 * @param {string} slug The channel name
 * @param {number} user_id The channel creator
 */
export const addChannel = async (slug: string, user_id: number): Promise<Channel[] | undefined> => {
  try {
    let { data } = await supabase
      .from('channels')
      .insert([{ slug, created_by: user_id }])
      .select()
    return data as Channel[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Insert a new message into the DB
 * @param {string} message The message text
 * @param {number} channel_id
 * @param {number} user_id The author
 */
export const addMessage = async (
  message: string,
  channel_id: number,
  user_id: string
): Promise<Message[] | undefined> => {
  try {
    let { data } = await supabase.from('messages').insert([{ message, channel_id, user_id }]).select()
    return data as Message[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Delete a channel from the DB
 * @param {number} channel_id
 */
export const deleteChannel = async (channel_id: number): Promise<Channel[] | undefined> => {
  try {
    let { data } = await supabase.from('channels').delete().match({ id: channel_id })
    return (data || []) as Channel[]
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Delete a message from the DB
 * @param {number} message_id
 */
export const deleteMessage = async (message_id: number): Promise<Message[] | undefined> => {
  try {
    let { data } = await supabase.from('messages').delete().match({ id: message_id })
    return (data || []) as Message[]
  } catch (error) {
    console.log('error', error)
  }
}
