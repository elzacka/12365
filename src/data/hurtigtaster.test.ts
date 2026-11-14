import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import type { Oppslag } from '../types'
import { buildIndex, searchOrd } from './searchIndex'
import { GROUPS } from './hurtigtaster'

// Every tag has a group, so every entry shows under its first tag.
const TAGS = new Set(GROUPS.map(g => g.tag))
const entries = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/content/hurtigtaster.json'), 'utf8'),
) as Oppslag[]

describe('hurtigtaster.json', () => {
  it('has unique ids and only known tags', () => {
    expect(new Set(entries.map(e => e.id)).size).toBe(entries.length)
    for (const e of entries) {
      expect(e.tags.length, e.id).toBeGreaterThan(0)
      for (const t of e.tags) expect(TAGS.has(t), `${e.id}: ${t}`).toBe(true)
    }
  })

  // The collapsed row previews line 1, so it must be the key combination alone.
  it('starts every explanation with the key combination in bold', () => {
    for (const e of entries) {
      expect(e.forklaring.split('\n')[0], e.id).toMatch(/^\*\*[^*]+\*\*$/)
    }
  })

  it('finds a key inside a combination', () => {
    const hits = searchOrd(buildIndex(entries), new Map(entries.map(e => [e.id, e])), 'skift')
    expect(hits.map(e => e.id)).toContain('demp-eller-slaa-paa-mikrofonen')
  })
})
