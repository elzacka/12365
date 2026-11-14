import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import type { Oppslag } from '../types'
import { buildIndex, searchOrd } from './searchIndex'
import { GROUPS } from './hurtigtaster'
import { keyLabel, parseKeys } from '../lib/keys'

const TAGS = new Set(GROUPS.map(g => g.tag))
const entries = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/content/hurtigtaster.json'), 'utf8'),
) as Oppslag[]

// Microsoft describes these in words, not as keys.
const DESCRIBED = new Set([
  'En hvilken som helst alfanumerisk nøkkel',
  'Første bokstaven i et mappenavn',
  'Første bokstav i et alternativ i en rullegardinliste',
  'Skriv inn én eller flere bokstaver i navnet som kortet er arkivert under, eller navnet på feltet du sorterer etter',
  'Hjem Trykk og hold nede høyre og venstre museknapp i to sekunder',
])

describe('hurtigtaster.json', () => {
  it('has unique ids and one app tag with a group', () => {
    expect(new Set(entries.map(e => e.id)).size).toBe(entries.length)
    for (const e of entries) {
      expect(e.tags.length, e.id).toBe(1)
      expect(TAGS.has(e.tags[0]), `${e.id}: ${e.tags[0]}`).toBe(true)
    }
  })

  it('holds one line of keys that shows at least one key', () => {
    for (const e of entries) {
      expect(e.tittel, e.id).not.toMatch(/^\s|\.$/)
      expect(e.forklaring, e.id).not.toContain('\n')
      if (!DESCRIBED.has(e.forklaring)) expect(parseKeys(e.forklaring).some(s => 'key' in s), e.forklaring).toBe(true)
    }
  })

  it('names every key it shows', () => {
    const unknown = entries.flatMap(e => parseKeys(e.forklaring).flatMap(s => ('key' in s && keyLabel(s.key).unknown ? [s.key] : [])))
    expect(unknown).toEqual([])
  })

  it('finds a key inside a combination', () => {
    const target = entries.find(e => /^CTRL\+SKIFT\+M$/i.test(e.forklaring))!
    const hits = searchOrd(buildIndex(entries), new Map(entries.map(e => [e.id, e])), 'skift')
    expect(hits).toContain(target)
  })
})
