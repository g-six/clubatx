import { createContext } from 'react'
import { ClubAtxUser } from './models/user/types'

const UserContext = createContext({
  authLoaded: false,
  signOut() {},
} as {
  authLoaded?: boolean
  user?: ClubAtxUser
  signOut(): void
  token?: string
})

export default UserContext
