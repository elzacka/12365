#!/usr/bin/env node
// Encrypts dev_only/locked-content.source.json into
// public/content/locked.json using AES-GCM-256 with PBKDF2-derived key.
//
// Usage:
//   npm run lock
//
// The script will prompt for the passphrase (echo is suppressed). This is the
// recommended path — typing the passphrase on the command line as an env var
// would leak it into shell history. Only set LOCK_PASSPHRASE for unattended
// CI-style runs, and never from an interactive shell.
//
// The source file is gitignored (dev_only/ is gitignored). Only the encrypted
// blob is committed and deployed.

import { readFile, writeFile, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { webcrypto } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const projectRoot = resolve(dirname(__filename), '..')
const sourcePath = resolve(projectRoot, 'dev_only/locked-content.source.json')
const outputPath = resolve(projectRoot, 'public/content/locked.json')
const publicArticlesPath = resolve(projectRoot, 'public/content/articles.json')

const PBKDF2_ITERATIONS = 310_000

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64')
}

async function deriveKey(passphrase, salt) {
  const baseKey = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  )
  return webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
}

// Invariants for the gated/public boundary. Run before we encrypt anything.
// If any of these fail we refuse to write a new locked.json — that prevents
// pushing content where a public listing leaks the existence of a gated item.
function validateBoundary(source, publicCategories) {
  const errors = []

  const lockedArticleIds = new Set()
  for (const cat of source.articles ?? []) {
    for (const art of cat.artikler ?? []) {
      if (art.laast) lockedArticleIds.add(art.id)
    }
  }

  const publicArticleIds = new Set()
  for (const cat of publicCategories ?? []) {
    for (const art of cat.artikler ?? []) {
      publicArticleIds.add(art.id)
    }
  }

  // 1. id collisions between locked and public articles.
  for (const id of lockedArticleIds) {
    if (publicArticleIds.has(id)) {
      errors.push(`ID-kollisjon: «${id}» finnes både offentlig og som låst artikkel.`)
    }
  }

  // 2. public articles must never reference a locked article id via `relaterte`.
  // The render layer already skips missing lookups, but having the id in
  // public JSON would still leak the existence to anyone reading the file.
  for (const cat of publicCategories ?? []) {
    for (const art of cat.artikler ?? []) {
      for (const relId of art.relaterte ?? []) {
        if (lockedArticleIds.has(relId)) {
          errors.push(`Offentlig artikkel «${art.id}» refererer til låst artikkel «${relId}» i relaterte. Fjern referansen.`)
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('Brudd på regler for låst innhold — locked.json er ikke skrevet:')
    for (const e of errors) console.error('  - ' + e)
    process.exit(1)
  }
}

async function promptHidden(question) {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true })
  // Silence the echo while typing. The readline lib still echos by default, so
  // we override the output's _write while the question is active.
  const originalWrite = stdout.write.bind(stdout)
  let muted = false
  stdout.write = (chunk, ...rest) => (muted ? originalWrite('', ...rest) : originalWrite(chunk, ...rest))
  originalWrite(question)
  muted = true
  try {
    const answer = await rl.question('')
    return answer
  } finally {
    muted = false
    stdout.write = originalWrite
    rl.close()
    originalWrite('\n')
  }
}

async function main() {
  try {
    await access(sourcePath)
  } catch {
    console.error(`Kildefil mangler: ${sourcePath}`)
    console.error('Opprett dev_only/locked-content.source.json med strukturen { "cards": [...], "articles": [...], "videos": [...] } og prøv igjen.')
    process.exit(1)
  }

  const source = JSON.parse(await readFile(sourcePath, 'utf8'))

  let publicCategories = []
  try {
    publicCategories = JSON.parse(await readFile(publicArticlesPath, 'utf8'))
  } catch {
    // Missing public articles.json is unusual but not fatal — boundary check
    // simply has nothing to compare against.
  }
  validateBoundary(source, publicCategories)

  let passphrase = process.env.LOCK_PASSPHRASE
  if (!passphrase) {
    passphrase = await promptHidden('Passordfrase: ')
  }
  if (!passphrase || passphrase.length < 8) {
    console.error('Passordfrasen må være minst 8 tegn.')
    process.exit(1)
  }

  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const iv = webcrypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const ciphertext = new Uint8Array(
    await webcrypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(source)),
    ),
  )

  const payload = {
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
    ciphertextB64: bytesToBase64(ciphertext),
  }

  await writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')

  const sizeKb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(1)
  console.log(`Skrev ${outputPath} (${sizeKb} kB)`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
