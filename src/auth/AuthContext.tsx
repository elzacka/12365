import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LockedContent } from '../types'
import { AuthContext, STORAGE_KEY, type AuthContextValue } from './context'
import { decryptJson, type EncryptedPayload } from './crypto'

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
  // Initial state is derived synchronously from localStorage so we don't need
  // to setState in the effect body (which the react-hooks lint rule flags).
  const [initializing, setInitializing] = useState(() => localStorage.getItem(STORAGE_KEY) !== null)

  const tryDecrypt = useCallback(async (passphrase: string): Promise<LockedContent> => {
    const payload = await fetchLockedPayload()
    return decryptJson<LockedContent>(payload, passphrase)
  }, [])

  // Auto-unlock from a saved passphrase. Runs once on mount.
  useEffect(() => {
    let cancelled = false
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
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
