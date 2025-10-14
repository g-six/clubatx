'use client'

import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import { parseForm } from '@/lib/form'
import { postRequest } from '@/lib/helpers/api'
import { supabase } from '@/lib/store'
import { use, useEffect, useState } from 'react'

export function generateSessionId(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let sessionId = ''
  for (let i = 0; i < length; i++) {
    sessionId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return sessionId
}

export default function ClientComponent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const search = use(searchParams)

  const [signingIn, setSigningIn] = useState('Sign In')
  const handleLogin = async (type: string, email: string, password: string) => {
    try {
      setSigningIn('Signing In...')
      const { error, data: user } = await supabase.from('users').select('*').eq('username', email).single()

      if (user) {
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const credential = {
          user: email,
          code,
          session_id: generateSessionId(),
        }
        const session = await supabase.from('credentials').insert(credential).select().single()

        if (session.data) {
          setSigningIn('Hold tight...')
          postRequest('/api/email', {
            TemplateAlias: 'user-login',
            TemplateModel: {
              action_url: `${location.href.split('/').slice(0, 3).join('/')}/login?code=${code}`,
              name: user.first_name,
            },
            To: email,
          }).then((r) => {
            setSigningIn('Check your email!')
          })
        }
      }
      // If the user doesn't exist here and an error hasn't been raised yet,
      // that must mean that a confirmation email has been sent.
      // NOTE: Confirming your email address is required by default.
      if (error) {
        alert('Error with auth: ' + error.message)
      }
    } catch (error: any) {
      console.log('error', error)
      alert(error.error_description || error)
      setSigningIn('Sign In')
    }
  }

  useEffect(() => {
    if (search.get('code')) {
      setSigningIn('Confirming your sign-in...')

      supabase
        .from('credentials')
        .select('*, user(id, first_name, last_name, username)')
        .eq('code', search.get('code'))
        .single()
        .then((r) => {
          postRequest('/api/session', {
            ...r.data,
            ...r.data.user,
            user: undefined,
          }).then((x) => {
            setSigningIn('Checking for your booking...')
            Promise.all([
              supabase.from('bookings').select().eq('id', search.get('booking')),
              supabase.from('credentials').delete().eq('user', r.data.user.username).neq('code', r.data.code),
            ]).then(([bookings]) => {
              if (localStorage.getItem('token')) {
                localStorage.setItem('session_id', x.session_id)
                setSigningIn('Logged in!')
                if (bookings?.data?.length) {
                  const booking = bookings.data.pop()
                  Promise.all([
                    supabase
                      .from('teams')
                      .select()
                      .ilike('name', booking.team)
                      .then((team) => {
                        if (team.data?.length) {
                          setSigningIn('Hold on...')
                          return team.data?.pop()
                        } else {
                          setSigningIn(`Building ${booking.team}`)
                          return supabase
                            .from('teams')
                            .insert({ name: booking.team, created_by: r.data.user.id })
                            .select()
                            .then((t) => {
                              return t.data?.pop()
                            })
                        }
                      }),
                    supabase
                      .from('events')
                      .upsert({
                        start_date: booking.start_date,
                        start_time: booking.start_time,
                        team: booking.team,
                        location: booking.location,
                        created_by: r.data.user.id,
                        slug:
                          booking.start_date.replace(/-/g, '') +
                          booking.start_time.replace(/:/g, '') +
                          '-' +
                          r.data.user.username.replace(/[^a-zA-Z0-9]/, '-').toLowerCase(),
                        event_type: 'MATCH',
                        duration: 90,
                      })
                      .select()
                      .then((e) => e.data?.pop()),
                  ]).then(([team, event]) => {
                    setTimeout(() => {
                      location.href = '/events'
                    }, 800)
                  })
                } else {
                  setTimeout(() => {
                    location.href = '/events'
                  }, 800)
                }
              }
            })
          })
        })
    }
  }, [])

  if (search.get('code')) {
    return <p className="w-full text-center">{signingIn}</p>
  }

  return signingIn === 'Check your email!' ? (
    <div className="text-center">
      <Heading className="mb-4">{signingIn}</Heading>
      <Text>You may close this page.</Text>
    </div>
  ) : (
    <form
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const { email, password } = parseForm(form)
        await handleLogin('LOGIN', email, password)
      }}
      className="grid w-full max-w-sm grid-cols-1 gap-6"
    >
      <Heading className="text-center">Sign in to your account</Heading>
      <Field>
        <Label>Email</Label>
        <Input type="email" name="email" />
      </Field>
      <div className="flex items-center justify-between">
        <CheckboxField>
          <Checkbox name="remember" />
          <Label>Remember me</Label>
        </CheckboxField>
        <Text>
          <TextLink href="/forgot-email">
            <Strong>Forgot email?</Strong>
          </TextLink>
        </Text>
      </div>
      <Button type="submit" className="w-full">
        {signingIn}
      </Button>
      <Text>
        Don’t have an account?{' '}
        <TextLink href="/register">
          <Strong>Sign up</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
