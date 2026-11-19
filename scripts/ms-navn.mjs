// Looks up Microsoft's own Norwegian UI strings in the Office apps installed on this Mac.
// Usage: npm run ms-navn -- "Track Changes"   (matches English or Norwegian, case-insensitive)
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const APPS = ['Microsoft Word', 'Microsoft Excel', 'Microsoft PowerPoint', 'Microsoft Outlook', 'Microsoft OneNote', 'Microsoft Teams', 'OneDrive']
const MAX_LENGTH = 100

const query = process.argv.slice(2).join(' ').trim().toLowerCase()
if (!query) {
  console.error('Bruk: npm run ms-navn -- "Track Changes"')
  process.exit(1)
}

const readPlist = (path) => {
  try {
    return JSON.parse(execFileSync('plutil', ['-convert', 'json', '-o', '-', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
  } catch {
    return {}
  }
}

// Cheap byte check before plutil: binary plists hold strings as ASCII or UTF-16BE, so drop NULs.
const mayContain = (path) => readFileSync(path).toString('latin1').replaceAll('\0', '').toLowerCase().includes(query)

const asciiQuery = /^[\x20-\x7e]*$/.test(query)
let hits = 0
for (const app of APPS) {
  const res = `/Applications/${app}.app/Contents/Resources`
  const nbDir = ['no.lproj', 'nb.lproj'].map((d) => join(res, d)).find(existsSync)
  const enDir = join(res, 'en.lproj')
  if (!nbDir || !existsSync(enDir)) continue
  const version = readPlist(`/Applications/${app}.app/Contents/Info.plist`).CFBundleShortVersionString
  const pairs = new Map()
  for (const file of readdirSync(enDir).filter((f) => f.endsWith('.strings'))) {
    const nbPath = join(nbDir, file)
    if (!existsSync(nbPath)) continue
    if (asciiQuery && !mayContain(join(enDir, file)) && !mayContain(nbPath)) continue
    const en = readPlist(join(enDir, file))
    const nb = readPlist(nbPath)
    for (const [key, enText] of Object.entries(en)) {
      const nbText = nb[key]
      if (typeof enText !== 'string' || typeof nbText !== 'string' || enText.length > MAX_LENGTH) continue
      if (!enText.toLowerCase().includes(query) && !nbText.toLowerCase().includes(query)) continue
      pairs.set(`${enText}\t${nbText}`, [enText, nbText])
    }
  }
  if (!pairs.size) continue
  // Exact label first, then the shortest: the button name, before tooltips and messages.
  const rank = ([en, nb]) => (en.toLowerCase() === query || nb.toLowerCase() === query ? 0 : 1)
  const sorted = [...pairs.values()].sort((a, b) => rank(a) - rank(b) || a[0].length - b[0].length)
  console.log(`\n${app} ${version ?? ''}`)
  for (const [en, nb] of sorted) console.log(`  ${en}  →  ${nb}`)
  hits += sorted.length
}
console.log(hits ? `\n${hits} treff` : 'Ingen treff i de installerte appene')
