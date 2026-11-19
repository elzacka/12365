// AES-GCM-256 + PBKDF2 for gated content: keeps it from casual visitors of the public
// site. A shared passphrase derives the key client-side; IndexedDB keeps keys only on opt-in.

export interface EncryptedPayload {
  version: 1
  kdf: {
    name: 'PBKDF2'
    hash: 'SHA-256'
    iterations: number
    saltB64: string
  }
  cipher: {
    name: 'AES-GCM'
    ivB64: string
  }
  ciphertextB64: string
}

// Use ArrayBuffer-backed Uint8Array explicitly. TypeScript's WebCrypto typings
// reject Uint8Array whose buffer could be a SharedArrayBuffer (the default in
// recent lib.dom).
type Bytes = Uint8Array<ArrayBuffer>

function newBytes(length: number): Bytes {
  return new Uint8Array(new ArrayBuffer(length)) as Bytes
}

function base64ToBytes(b64: string): Bytes {
  const binary = atob(b64)
  const bytes = newBytes(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Non-extractable, so a stored key never yields the passphrase.
export function importPassphrase(passphrase: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), { name: 'PBKDF2' }, false, [
    'deriveKey',
  ])
}

// The salt and iteration count come from the payload; scripts/lock-content.mjs sets them.
export function deriveContentKey(baseKey: CryptoKey, payload: EncryptedPayload): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: base64ToBytes(payload.kdf.saltB64), iterations: payload.kdf.iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

// Throws OperationError on a wrong key; the caller must catch.
export async function decryptJson<T>(payload: EncryptedPayload, key: CryptoKey): Promise<T> {
  const iv = base64ToBytes(payload.cipher.ivB64)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(payload.ciphertextB64))
  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}
