import { createContext } from 'react'
import type { LockedContent } from '../types'

export interface AuthContextValue {
  unlocked: boolean
  locked: LockedContent | null
  unlock: (passphrase: string, remember: boolean) => Promise<void>
  lock: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const LEGACY_STORAGE_KEY = '12365.passphrase'
