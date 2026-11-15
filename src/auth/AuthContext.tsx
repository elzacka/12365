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

// Storage can be blocked by the browser; the app then works, just without remembering.
function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeSaved(passphrase: string | null) {
  try {
    if (passphrase) localStorage.setItem(STORAGE_KEY, passphrase)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked: nothing saved
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<LockedContent | null>(null)

  const tryDecrypt = useCallback(async (passphrase: string): Promise<LockedContent> => {
    const payload = await fetchLockedPayload()
    return decryptJson<LockedContent>(payload, passphrase)
  }, [])

  // Auto-unlock from a saved passphrase. Runs once on mount.
  useEffect(() => {
    let cancelled = false
    const saved = readSaved()
    if (!saved) return
    tryDecrypt(saved)
      .then(content => {
        if (!cancelled) setLocked(content)
      })
      .catch(() => {
        // The saved passphrase no longer fits the deployed payload (rotated,
        // wrong, or the payload is unavailable). Clear it silently so we don't
        // keep retrying on every page load.
        writeSaved(null)
      })
    return () => {
      cancelled = true
    }
  }, [tryDecrypt])

  const unlock = useCallback(
    async (passphrase: string, remember: boolean) => {
      const content = await tryDecrypt(passphrase)
      setLocked(content)
      writeSaved(remember ? passphrase : null)
    },
    [tryDecrypt],
  )

  const lockNow = useCallback(() => {
    setLocked(null)
    writeSaved(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      unlocked: locked !== null,
      locked,
      unlock,
      lock: lockNow,
    }),
    [locked, unlock, lockNow],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
