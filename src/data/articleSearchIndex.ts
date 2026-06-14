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

// Eksakt- og nær-eksakt-bonus slik at titteltreff alltid slår innholdstreff,
// uavhengig av MiniSearch-score. Bruker lagrede felter fra indeksen.
function exactScore(tittel: string, tagsStr: string, raw: string): number {
  const q = raw.trim().toLowerCase()
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

export function buildArticleIndex(categories: ArticleCategory[]): MiniSearch<IndexedArticle> {
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
  for (const cat of categories) {
    for (const a of cat.artikler) {
      if (a.skjult) continue
      docs.push({
        id: a.id,
        tittel: a.tittel,
        ingress: a.ingress,
        tags: a.tags.join(' '),
        stegTitler: a.steg.map(s => s.tittel).join(' '),
        stegInnhold: a.steg.map(s => stripMarkdown(s.innhold)).join(' '),
        kategoriTittel: cat.tittel,
      })
    }
  }
  mini.addAll(docs)
  return mini
}

export function searchArticles(mini: MiniSearch<IndexedArticle>, raw: string): ArticleSearchHit[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  // AND-søk først; fall tilbake til OR hvis ingen treff slik at brukeren
  // alltid ser relevante resultater selv med delvis samsvar.
  let hits = mini.search(trimmed, { combineWith: 'AND' })
  if (hits.length === 0) hits = mini.search(trimmed, { combineWith: 'OR' })

  const withScore = hits.map(h => ({
    id: String(h.id),
    score: (h.score ?? 0) + exactScore(String(h.tittel ?? ''), String(h.tags ?? ''), trimmed),
  }))

  withScore.sort((a, b) => b.score - a.score)
  return withScore
}
