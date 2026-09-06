import MiniSearch from 'minisearch'
import type { FlipCard } from '../types'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
}

function exactScore(navn: string, tagsStr: string, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const n = navn.toLowerCase()
  if (n === q) return 12_000
  if (n.startsWith(q + ' ') || n.startsWith(q + '-')) return 2_000

  const qWords = q.split(/\s+/).filter(Boolean)
  if (qWords.length > 1 && qWords.every(w => n.includes(w))) return 1_000

  const tags = tagsStr.split(' ').filter(Boolean)
  if (qWords.length === 1 && tags.some(t => t.toLowerCase() === q)) return 800
  if (qWords.length === 1 && n.includes(q)) return 500

  return 0
}

interface ParsedQuery {
  phrases: string[]
  terms: string[]
  combineWith: 'AND' | 'OR'
}

function parseQuery(raw: string): ParsedQuery {
  const phrases: string[] = []
  const phraseRegex = /"([^"]+)"/g
  const without = raw.replace(phraseRegex, (_, p) => {
    const trimmed = (p as string).trim()
    if (trimmed) phrases.push(trimmed)
    return ' '
  })

  const tokens = without.split(/\s+/).filter(Boolean)
  let combineWith: 'AND' | 'OR' = 'AND'
  const terms: string[] = []
  for (const t of tokens) {
    if (/^or$/i.test(t)) combineWith = 'OR'
    else if (/^and$/i.test(t)) continue
    else terms.push(t)
  }
  return { phrases, terms, combineWith }
}

interface IndexedCard {
  navn: string
  tagline: string
  alene: string
  sammen: string
  oppsummering: string
  tags: string
  alias: string
}

export interface CardSearchHit {
  navn: string
  score: number
}

export interface CardIndex {
  index: MiniSearch<IndexedCard>
  haystacks: Map<string, string>
}

export function buildCardIndex(cards: FlipCard[]): CardIndex {
  const mini = new MiniSearch<IndexedCard>({
    fields: ['navn', 'tagline', 'alias', 'tags', 'oppsummering', 'alene', 'sammen'],
    storeFields: ['navn', 'tags'],
    idField: 'navn',
    processTerm: (term) => {
      const n = normalize(term)
      return n || null
    },
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
      boost: { navn: 10, alias: 9, tagline: 5, tags: 5, oppsummering: 3, alene: 1, sammen: 1 },
      combineWith: 'AND',
    },
  })

  const haystacks = new Map<string, string>()
  mini.addAll(
    cards.map(c => {
      const tags = (c.tags ?? []).join(' ')
      const alias = (c.alias ?? []).join(' ')
      haystacks.set(c.navn, [c.navn, c.tagline, alias, tags, c.oppsummering ?? '', c.alene ?? '', c.sammen ?? ''].join(' '))
      return {
        navn: c.navn,
        tagline: c.tagline,
        alene: c.alene ?? '',
        sammen: c.sammen ?? '',
        oppsummering: c.oppsummering ?? '',
        tags,
        alias,
      }
    })
  )
  return { index: mini, haystacks }
}

export function searchCards(
  { index: mini, haystacks }: CardIndex,
  raw: string,
): CardSearchHit[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const parsed = parseQuery(trimmed)
  const queryParts = [...parsed.phrases, ...parsed.terms].join(' ').trim()
  if (!queryParts) return []

  let hits = mini.search(queryParts, { combineWith: parsed.combineWith })
  if (hits.length === 0 && parsed.combineWith === 'AND') {
    hits = mini.search(queryParts, { combineWith: 'OR' })
  }

  if (parsed.phrases.length > 0) {
    const lowerPhrases = parsed.phrases.map(p => p.toLowerCase())
    hits = hits.filter(h => {
      const hay = (haystacks.get(String(h.id)) ?? '').toLowerCase()
      return lowerPhrases.every(p => hay.includes(p))
    })
  }

  const withScore = hits.map(h => ({
    navn: String(h.id),
    score: (h.score ?? 0) + exactScore(String(h.navn ?? h.id), String(h.tags ?? ''), queryParts),
  }))

  withScore.sort((a, b) => b.score - a.score)
  return withScore
}
