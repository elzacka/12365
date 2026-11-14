import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import type { Oppslag } from '../types'
import { buildIndex, searchOrd } from './searchIndex'
import { GROUPS } from './hurtigtaster'
import { keyLabel, parseKeys } from '../lib/keys'

const TAGS = new Set(GROUPS.map(g => g.tag))
const GENERAL_TAGS = ['microsoft 365', 'windows', 'tegn/emojis', 'internasjonale tegn']
const entries = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/content/hurtigtaster.json'), 'utf8'),
) as Oppslag[]

describe('hurtigtaster.json', () => {
  it('has unique ids and one app tag with a group, after «internasjonale tegn» if present', () => {
    expect(new Set(entries.map(e => e.id)).size).toBe(entries.length)
    for (const e of entries) {
      const [first, ...rest] = e.tags[0] === 'internasjonale tegn' ? e.tags.slice(1) : e.tags
      expect(rest, e.id).toEqual([])
      expect(TAGS.has(first) && first !== 'internasjonale tegn', `${e.id}: ${first}`).toBe(true)
    }
  })

  it('gives every row in a section with subheadings one its section lists', () => {
    for (const g of GROUPS.filter(g => g.undergrupper)) {
      const rows = entries.filter(e => e.tags[0] === g.tag)
      expect(rows.filter(e => !g.undergrupper!.includes(e.undergruppe ?? '')).map(e => e.id), g.tag).toEqual([])
    }
  })

  it('lists the apps alphabetically, then the general sections', () => {
    const apps = GROUPS.filter(g => !GENERAL_TAGS.includes(g.tag)).map(g => g.title)
    expect(apps).toEqual([...apps].sort((a, b) => a.localeCompare(b, 'nb')))
    expect(GROUPS.slice(-GENERAL_TAGS.length).map(g => g.tag)).toEqual(GENERAL_TAGS)
  })

  it('holds one line of keys that shows at least one key', () => {
    for (const e of entries) {
      expect(e.tittel, e.id).not.toMatch(/^\s|\.$/)
      expect(e.forklaring, e.id).not.toContain('\n')
      expect(parseKeys(e.forklaring).some(s => 'key' in s), e.forklaring).toBe(true)
    }
  })

  it('needs no numeric keypad and no Page up, Page down, Home or End key', () => {
    const absent = new Set(['Page up', 'Page down', 'Home', 'End'])
    const laptopless = entries.filter(e =>
      /ALT\+0\d{3}|talltastatur/i.test(e.forklaring)
      || parseKeys(e.forklaring).some(s => 'key' in s && absent.has(keyLabel(s.key).name)))
    expect(laptopless.map(e => e.id)).toEqual([])
  })

  it('names every key it shows', () => {
    const unknown = entries.flatMap(e => parseKeys(e.forklaring).flatMap(s => ('key' in s && keyLabel(s.key).unknown ? [s.key] : [])))
    expect(unknown).toEqual([])
  })

  it('lists each shortcut once per section, whatever the key casing', () => {
    const keys = entries.map(e => [e.tags[0], e.undergruppe, e.tittel, e.forklaring.toLowerCase()].join('|'))
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([])
  })

  it('writes the Norwegian key name Skift, so a search for «skift» finds every row', () => {
    expect(entries.filter(e => /shift/i.test(e.forklaring)).map(e => e.id)).toEqual([])
  })

  it('finds the Teams microphone shortcut when searching «mikrofon»', () => {
    const hits = searchOrd(buildIndex(entries), new Map(entries.map(e => [e.id, e])), 'mikrofon')
    expect(hits.some(e => e.tags[0] === 'teams')).toBe(true)
  })

  it('finds a key inside a combination', () => {
    const target = entries.find(e => /^CTRL\+SKIFT\+M$/i.test(e.forklaring))!
    const hits = searchOrd(buildIndex(entries), new Map(entries.map(e => [e.id, e])), 'skift')
    expect(hits).toContain(target)
  })
})
