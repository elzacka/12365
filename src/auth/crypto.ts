// AES-GCM-256 + PBKDF2 helpers for gated content.
//
// Threat model: keep gated content out of reach of casual visitors of the
// public site. A shared passphrase derives a key client-side; the passphrase
// is stored in localStorage only if the user opts in.

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

const PBKDF2_ITERATIONS = 310_000

// Use ArrayBuffer-backed Uint8Array explicitly. TypeScript's WebCrypto typings
// reject Uint8Array whose buffer could be a SharedArrayBuffer (the default in
// recent lib.dom).
type Bytes = Uint8Array<ArrayBuffer>

function newBytes(length: number): Bytes {
  return new Uint8Array(new ArrayBuffer(length)) as Bytes
}

function bytesToBase64(bytes: Bytes): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Bytes {
  const binary = atob(b64)
  const bytes = newBytes(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function deriveKey(passphrase: string, salt: Bytes, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptJson(plaintext: unknown, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(newBytes(16))
  const iv = crypto.getRandomValues(newBytes(12))
  const key = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(plaintext)),
  )
  return {
    version: 1,
    kdf: {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: PBKDF2_ITERATIONS,
      saltB64: bytesToBase64(salt),
    },
    cipher: {
      name: 'AES-GCM',
      ivB64: bytesToBase64(iv),
    },
    ciphertextB64: bytesToBase64(new Uint8Array(ciphertext) as Bytes),
  }
}

export async function decryptJson<T>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  const salt = base64ToBytes(payload.kdf.saltB64)
  const iv = base64ToBytes(payload.cipher.ivB64)
  const ciphertext = base64ToBytes(payload.ciphertextB64)
  const key = await deriveKey(passphrase, salt, payload.kdf.iterations)
  // Throws OperationError on wrong passphrase — caller must catch.
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  const text = new TextDecoder().decode(plaintext)
  return JSON.parse(text) as T
}
