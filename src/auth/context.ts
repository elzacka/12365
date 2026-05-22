import { createContext } from 'react'
import type { LockedContent } from '../types'

export interface AuthContextValue {
  unlocked: boolean
  locked: LockedContent | null
  initializing: boolean // true while we try auto-unlock from a saved passphrase
  unlock: (passphrase: string, remember: boolean) => Promise<void>
  lock: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const STORAGE_KEY = '12365.passphrase'
