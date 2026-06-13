// Parses dev_only/ordbok.md and writes public/content/ordbok.json.
// Source MD is a three-column table: | Ord | Forklaring | Tags |.
// When the first cell is an acronym followed by a parenthesised fullform
// ("AGI (kunstig generell intelligens)"), the parser swaps so the fullform
// becomes the canonical tittel and the acronym becomes the undertittel –
// keeps the alphabetical browse rooted in plain Norwegian per klarspråk.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'dev_only/ordbok.md')
const TARGET = resolve(ROOT, 'public/content/ordbok.json')

// Tags that should be unified before write. Keeps search and grouping
// consistent across rows where the editor used either form.
const TAG_ALIASES = {
  ai: 'ki',
}

function isAcronym(s) {
  if (/\s/.test(s)) return false
  if (s.includes('-')) return false
  const letters = s.replace(/[^A-Za-z]/g, '')
  if (letters.length < 2) return false
  const caps = letters.replace(/[^A-Z]/g, '').length
  return caps / letters.length >= 0.5
}

function capitalizeFirst(s) {
  if (!s) return s
  return s[0].toLocaleUpperCase('nb') + s.slice(1)
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseOrdCell(raw) {
  const m = raw.match(/^(.+?)\s*\((.+)\)\s*$/)
  if (!m) {
    const t = raw.trim()
    return { tittel: t, undertittel: undefined, idBase: t }
  }
  const left = m[1].trim()
  const right = m[2].trim()
  if (isAcronym(left)) {
    return {
      tittel: capitalizeFirst(right),
      undertittel: left,
      idBase: left,
    }
  }
  return { tittel: left, undertittel: right, idBase: left }
}

function parseTagsCell(raw) {
  const tags = []
  const seen = new Set()
  for (const piece of raw.split(/\s+/)) {
    const clean = piece.replace(/`/g, '').trim().toLowerCase()
    if (!clean) continue
    const final = TAG_ALIASES[clean] ?? clean
    if (seen.has(final)) continue
    seen.add(final)
    tags.push(final)
  }
  return tags
}

function parseAliasCell(raw) {
  if (!raw) return []
  const seen = new Set()
  const out = []
  for (const piece of raw.split(',')) {
    const clean = piece.trim()
    if (!clean) continue
    const key = clean.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(clean)
  }
  return out
}

function parseTable(md) {
  const lines = md.split('\n')
  const rows = []
  let seenHeader = false
  for (const line of lines) {
    if (!line.startsWith('|')) continue
    if (/^\|\s*-+/.test(line)) continue
    if (!seenHeader) {
      seenHeader = true
      continue
    }
    const cells = line
      .replace(/^\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map(c => c.trim())
    if (cells.length < 3) continue
    if (!cells[0]) continue
    // Pad to 4 cells so the alias cell is always present in downstream code.
    while (cells.length < 4) cells.push('')
    rows.push(cells)
  }
  return rows
}

function main() {
  const md = readFileSync(SOURCE, 'utf-8')
  const rows = parseTable(md)

  const ord = []
  const idSet = new Set()
  const errors = []
  const unknownTags = new Set()
  const KNOWN_TAGS = new Set([
    'ki',
    'iot',
    'sikkerhet',
    'personvern',
    'analyse',
    'database',
    'datakvalitet',
    'digitalisering',
    'programmering',
    'nettverkstek',
    'sky',
    'm365',
  ])

  for (const [ordCell, forklaringCell, tagsCell, aliasCell] of rows) {
    if (!ordCell || !forklaringCell) {
      errors.push(`Mangler pliktfelt: ${JSON.stringify({ ordCell, forklaringCell })}`)
      continue
    }
    const parsed = parseOrdCell(ordCell)
    const id = slugify(parsed.idBase)
    if (!id) {
      errors.push(`Tom ID fra "${ordCell}"`)
      continue
    }
    if (idSet.has(id)) {
      errors.push(`Duplisert ID "${id}" fra "${ordCell}"`)
      continue
    }
    idSet.add(id)

    const tags = parseTagsCell(tagsCell || '')
    for (const t of tags) {
      if (!KNOWN_TAGS.has(t)) unknownTags.add(t)
    }

    const alias = parseAliasCell(aliasCell || '')

    const item = {
      id,
      tittel: parsed.tittel,
      ...(parsed.undertittel ? { undertittel: parsed.undertittel } : {}),
      forklaring: forklaringCell,
      tags,
      ...(alias.length ? { alias } : {}),
    }
    ord.push(item)
  }

  if (errors.length) {
    console.error('Feil i ordbok.md:')
    for (const e of errors) console.error('  -', e)
    process.exit(1)
  }

  if (unknownTags.size > 0) {
    console.warn(
      `ordbok.md: ukjente tags brukt: ${[...unknownTags].join(', ')} ` +
      `(legg dem til i KNOWN_TAGS i generate-ordbok.mjs hvis bevisst).`,
    )
  }

  ord.sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb', { sensitivity: 'base' }))

  writeFileSync(TARGET, JSON.stringify(ord, null, 2) + '\n')
  console.log(`ordbok.json: ${ord.length} ord`)
}

main()
