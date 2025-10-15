import { generateSessionId } from '@/app/(auth)/login/client-component'
import { supabase } from '@/lib/store'

/**
 * Retrieves the current user's session information from the Supabase 'credentials' table.
 *
 * This function checks for a 'session_id' in the browser's localStorage. If found,
 * it queries the Supabase backend for the corresponding user associated with that session ID.
 *
 * @returns {Promise<any | undefined>} A promise that resolves to the user session object if found, or undefined if no session ID exists.
 *
 * @example
 * const session = await getUserSession();
 * if (session) {
 *   // User is logged in
 * }
 */
export async function getUserSession() {
  if (localStorage.getItem('session_id')) {
    const { data: session } = await supabase
      .from('credentials')
      .select('user')
      .eq('session_id', localStorage.getItem('session_id'))
      .single()

    return session
  }
}

export async function signUp({
  email: username,
  phone,
  first_name,
  last_name,
}: {
  email: string
  phone: string
  first_name: string
  last_name: string
}) {
  let { data } = await supabase.from('users').select().ilike('username', username)
  let user = data ? data.pop() : null
  if (!user) {
    user = await supabase
      .from('users')
      .insert({
        username,
        phone: phone
          .split('')
          .map((w) => w.trim())
          .filter((w) => !isNaN(Number(w)))
          .join(''),
        first_name,
        last_name,
        status: 'ONLINE',
      })
      .select()
      .single()
  }

  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const credential = {
      user: username,
      code,
      session_id: generateSessionId(),
    }

    const session = await supabase.from('credentials').insert(credential).select().single()

    return {
      user,
      session: session.data,
    }
  }
}
