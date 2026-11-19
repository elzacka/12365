import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LockedContent } from '../types'
import { AuthContext, LEGACY_STORAGE_KEY, type AuthContextValue } from './context'
import { decryptJson, deriveContentKey, importPassphrase, type EncryptedPayload } from './crypto'
import { readKeys, writeKeys, type SavedKeys } from './keyStore'

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

// Earlier builds kept the passphrase itself in localStorage: move it into a key, then drop it.
async function takeLegacyPassphrase(): Promise<SavedKeys | null> {
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!legacy) return null
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    return { baseKey: await importPassphrase(legacy) }
  } catch {
    return null
  }
}

// Reuses the cached content key while the payload is unchanged, so a saved unlock costs no PBKDF2.
async function openWith(saved: SavedKeys, remember: boolean): Promise<LockedContent> {
  const payload = await fetchLockedPayload()
  const cached =
    saved.contentKey && saved.saltB64 === payload.kdf.saltB64 && saved.iterations === payload.kdf.iterations
  const contentKey = cached ? saved.contentKey! : await deriveContentKey(saved.baseKey, payload)
  const content = await decryptJson<LockedContent>(payload, contentKey)
  if (remember && !cached) {
    await writeKeys({ baseKey: saved.baseKey, contentKey, saltB64: payload.kdf.saltB64, iterations: payload.kdf.iterations })
  }
  return content
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<LockedContent | null>(null)

  // Auto-unlock from saved keys. Runs once on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const saved = (await takeLegacyPassphrase()) ?? (await readKeys())
      if (!saved) return
      try {
        const content = await openWith(saved, true)
        if (!cancelled) setLocked(content)
      } catch {
        // The saved key no longer fits the deployed payload (rotated passphrase,
        // or the payload is unavailable). Clear it so we don't retry on every load.
        await writeKeys(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const unlock = useCallback(async (passphrase: string, remember: boolean) => {
    const content = await openWith({ baseKey: await importPassphrase(passphrase) }, remember)
    setLocked(content)
    if (!remember) await writeKeys(null)
  }, [])

  const lockNow = useCallback(() => {
    setLocked(null)
    void writeKeys(null)
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
