import MiniSearch from 'minisearch'
import type { ArticleCategory } from '../types'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
}

function stripMarkdown(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/◦\s/g, ' ')
    .replace(/→/g, ' ')
}

function exactScore(tittel: string, tagsStr: string, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const tit = tittel.toLowerCase()
  if (tit === q) return 12_000
  if (tit.startsWith(q + ' ') || tit.startsWith(q + '-') || tit.startsWith(q + ':')) return 2_000

  const qWords = q.split(/\s+/).filter(Boolean)
  if (qWords.length > 1 && qWords.every(w => tit.includes(w))) return 1_000

  const tags = tagsStr.split(' ').filter(Boolean)
  if (qWords.length === 1 && tags.some(t => t.toLowerCase() === q)) return 800
  if (qWords.length === 1 && tit.includes(q)) return 500

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

interface IndexedArticle {
  id: string
  tittel: string
  ingress: string
  tags: string
  stegTitler: string
  stegInnhold: string
  kategoriTittel: string
}

export interface ArticleSearchHit {
  id: string
  score: number
}

export interface ArticleIndex {
  index: MiniSearch<IndexedArticle>
  haystacks: Map<string, string>
}

export function buildArticleIndex(categories: ArticleCategory[]): ArticleIndex {
  const mini = new MiniSearch<IndexedArticle>({
    fields: ['tittel', 'ingress', 'tags', 'stegTitler', 'stegInnhold', 'kategoriTittel'],
    storeFields: ['id', 'tittel', 'tags'],
    idField: 'id',
    processTerm: (term) => {
      const n = normalize(term)
      return n || null
    },
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
      boost: { tittel: 10, tags: 6, ingress: 4, stegTitler: 3, kategoriTittel: 2, stegInnhold: 1 },
      combineWith: 'AND',
    },
  })

  const docs: IndexedArticle[] = []
  const haystacks = new Map<string, string>()

  for (const cat of categories) {
    for (const a of cat.artikler) {
      if (a.skjult) continue
      const stegInnhold = a.steg.map(s => stripMarkdown(s.innhold)).join(' ')
      const stegTitler = a.steg.map(s => s.tittel).join(' ')
      docs.push({
        id: a.id,
        tittel: a.tittel,
        ingress: a.ingress,
        tags: a.tags.join(' '),
        stegTitler,
        stegInnhold,
        kategoriTittel: cat.tittel,
      })
      haystacks.set(a.id, [a.tittel, a.ingress, a.tags.join(' '), stegTitler, stegInnhold].join(' '))
    }
  }
  mini.addAll(docs)
  return { index: mini, haystacks }
}

export function searchArticles(
  { index: mini, haystacks }: ArticleIndex,
  raw: string,
): ArticleSearchHit[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const parsed = parseQuery(trimmed)
  const queryParts = [...parsed.phrases, ...parsed.terms].join(' ').trim()
  if (!queryParts) return []

  let hits = mini.search(queryParts, { combineWith: parsed.combineWith })
  if (hits.length === 0 && parsed.combineWith === 'AND') {
    hits = mini.search(queryParts, { combineWith: 'OR' })
  }

  // Sitert frase må forekomme bokstavelig i artikkelteksten.
  if (parsed.phrases.length > 0) {
    const lowerPhrases = parsed.phrases.map(p => p.toLowerCase())
    hits = hits.filter(h => {
      const hay = (haystacks.get(String(h.id)) ?? '').toLowerCase()
      return lowerPhrases.every(p => hay.includes(p))
    })
  }

  const withScore = hits.map(h => ({
    id: String(h.id),
    score: (h.score ?? 0) + exactScore(String(h.tittel ?? ''), String(h.tags ?? ''), queryParts),
  }))

  withScore.sort((a, b) => b.score - a.score)
  return withScore
}
