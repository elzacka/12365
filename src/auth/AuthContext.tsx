import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LockedContent } from '../types'
import { decryptJson, type EncryptedPayload } from './crypto'

interface AuthContextValue {
  unlocked: boolean
  locked: LockedContent | null
  initializing: boolean // true while we try auto-unlock from a saved passphrase
  unlock: (passphrase: string, remember: boolean) => Promise<void>
  lock: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = '12365.passphrase'

const base = import.meta.env.BASE_URL

let payloadPromise: Promise<EncryptedPayload> | null = null

async function fetchLockedPayload(): Promise<EncryptedPayload> {
  payloadPromise ??= (async () => {
    const res = await fetch(`${base}content/locked.json`)
    if (!res.ok) {
      throw new Error(`Klarte ikke å hente låst innhold (${res.status})`)
    }
    return (await res.json()) as EncryptedPayload
  })()
  return payloadPromise
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<LockedContent | null>(null)
  const [initializing, setInitializing] = useState(true)

  const tryDecrypt = useCallback(async (passphrase: string): Promise<LockedContent> => {
    const payload = await fetchLockedPayload()
    return decryptJson<LockedContent>(payload, passphrase)
  }, [])

  // Auto-unlock from a saved passphrase. Runs once on mount.
  useEffect(() => {
    let cancelled = false
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      setInitializing(false)
      return
    }
    tryDecrypt(saved)
      .then(content => {
        if (!cancelled) setLocked(content)
      })
      .catch(() => {
        // The saved passphrase no longer fits the deployed payload (rotated,
        // wrong, or the payload is unavailable). Clear it silently so we don't
        // keep retrying on every page load.
        localStorage.removeItem(STORAGE_KEY)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [tryDecrypt])

  const unlock = useCallback(
    async (passphrase: string, remember: boolean) => {
      const content = await tryDecrypt(passphrase)
      setLocked(content)
      if (remember) {
        localStorage.setItem(STORAGE_KEY, passphrase)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    [tryDecrypt],
  )

  const lockNow = useCallback(() => {
    setLocked(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      unlocked: locked !== null,
      locked,
      initializing,
      unlock,
      lock: lockNow,
    }),
    [locked, initializing, unlock, lockNow],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth må brukes innenfor en AuthProvider')
  }
  return ctx
}
