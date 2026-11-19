// "Husk på denne enheten": non-extractable keys in IndexedDB, never the passphrase.
// The origin elzacka.github.io is shared with other apps, which then cannot read it.

export interface SavedKeys {
  baseKey: CryptoKey
  // Cached for the payload with this salt and iteration count: skips PBKDF2 on load.
  contentKey?: CryptoKey
  saltB64?: string
  iterations?: number
}

const DB_NAME = '12365.auth'
const STORE = 'keys'
const RECORD = 'remember'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = op(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(req.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

// Storage can be blocked by the browser; the app then works, just without remembering.
export async function readKeys(): Promise<SavedKeys | null> {
  try {
    return ((await run('readonly', s => s.get(RECORD))) as SavedKeys | undefined) ?? null
  } catch {
    return null
  }
}

export async function writeKeys(keys: SavedKeys | null): Promise<void> {
  try {
    await run('readwrite', s => (keys ? s.put(keys, RECORD) : s.delete(RECORD)))
  } catch {
    // storage blocked: nothing saved
  }
}
