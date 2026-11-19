// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { decryptJson, deriveContentKey, importPassphrase, type EncryptedPayload } from './crypto'

const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')

// Same scheme as scripts/lock-content.mjs, with few iterations to keep the test fast.
async function lock(data: unknown, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const iterations = 1000
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data))))
  return {
    version: 1,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations, saltB64: b64(salt) },
    cipher: { name: 'AES-GCM', ivB64: b64(iv) },
    ciphertextB64: b64(ct),
  }
}

describe('gated content crypto', () => {
  it('decrypts with the passphrase and keeps the keys non-extractable', async () => {
    const payload = await lock({ cards: [{ id: 'x' }] }, 'riktig hest batteri stift')
    const baseKey = await importPassphrase('riktig hest batteri stift')
    const contentKey = await deriveContentKey(baseKey, payload)
    expect(await decryptJson(payload, contentKey)).toEqual({ cards: [{ id: 'x' }] })
    expect(baseKey.extractable).toBe(false)
    expect(contentKey.extractable).toBe(false)
  })

  it('rejects a wrong passphrase', async () => {
    const payload = await lock({ cards: [] }, 'riktig hest batteri stift')
    const contentKey = await deriveContentKey(await importPassphrase('feil frase her'), payload)
    await expect(decryptJson(payload, contentKey)).rejects.toThrow()
  })
})
