import MiniSearch from 'minisearch'
import type { Ord } from '../types'

// Diakritikkfjerning gjør at "polsomhet" matcher "Følsomhetsetikett" og
// "kunstig" matcher det samme uavhengig av store/små bokstaver.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
}

export interface IndexedOrd {
  id: string
  tittel: string
  undertittel: string
  alias: string
  forklaring: string
  tags: string
}

export function buildIndex(ord: Ord[]): MiniSearch<IndexedOrd> {
  const mini = new MiniSearch<IndexedOrd>({
    fields: ['tittel', 'undertittel', 'alias', 'forklaring', 'tags'],
    storeFields: ['id'],
    idField: 'id',
    processTerm: (term) => {
      const n = normalize(term)
      return n || null
    },
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
      boost: { tittel: 10, alias: 9, undertittel: 8, forklaring: 3, tags: 2 },
      combineWith: 'AND',
    },
  })
  mini.addAll(
    ord.map(o => ({
      id: o.id,
      tittel: o.tittel,
      undertittel: o.undertittel ?? '',
      alias: (o.alias ?? []).join(' '),
      forklaring: o.forklaring,
      tags: o.tags.join(' '),
    }))
  )
  return mini
}

interface ParsedQuery {
  phrases: string[]
  terms: string[]
  combineWith: 'AND' | 'OR'
}

// Plukker ut "siterte fraser", oppdager AND/OR-operatorer og returnerer
// resten som vanlige termer. Standardkombinasjonen er AND – brukerens
// forventning er at flere termer alle skal være med.
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

// Initialene av en streng. "General Data Protection Regulation" → "GDPR",
// "Kunstig intelligens" → "KI". Brukes for å gjenkjenne at fullformen
// (i tittel eller alias) er den utskrevne formen av et akronym brukeren
// søker på.
function initials(s: string): string {
  return s
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(w => (w[0] ?? '').toUpperCase())
    .join('')
}

function isAcronymCandidate(q: string): boolean {
  const u = q.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return u.length >= 2 && u.length <= 8
}

function tittelInitialsMatch(o: Ord, q: string): boolean {
  if (!isAcronymCandidate(q)) return false
  const u = q.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return initials(o.tittel) === u
}

function hasAliasInitialsMatch(o: Ord, q: string): boolean {
  if (!isAcronymCandidate(q)) return false
  const u = q.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  for (const a of o.alias ?? []) {
    if (initials(a) === u) return true
  }
  return false
}

// Eksakte treff vinner over alle MiniSearch-score. Når brukeren skriver
// "AI" eller "MFA" eller "Kunstig intelligens" som er nøyaktig en tittel,
// undertittel eller alias, skal det treffet stå øverst. For akronymer
// boostes også den oppføringen der tittel eller alias-fullformen har
// initialene som utgjør akronymet – slik at "GDPR" prioriterer
// "Personvernforordningen" (alias "General Data Protection Regulation")
// og "KI" prioriterer "Kunstig intelligens" (tittel-initialene matcher).
function exactScore(o: Ord, q: string): number {
  if (!q) return 0
  const qNorm = q.toLowerCase().trim()
  if (!qNorm) return 0

  if (o.tittel.toLowerCase() === qNorm) return 12_000

  const undertittelMatch = (o.undertittel ?? '').toLowerCase() === qNorm
  const titleInit = tittelInitialsMatch(o, q)
  const aliasInit = hasAliasInitialsMatch(o, q)
  const initialsMatch = titleInit || aliasInit
  if (undertittelMatch && initialsMatch) return 11_000
  if (initialsMatch) return 9_500
  if (undertittelMatch) return 9_000

  for (const a of o.alias ?? []) {
    if (a.toLowerCase() === qNorm) return 8_000
  }

  // Hele tittelen begynner med søketeksten ("kunstig" → "Kunstig intelligens")
  const tit = o.tittel.toLowerCase()
  if (tit.startsWith(qNorm + ' ') || tit.startsWith(qNorm + '-')) return 500
  return 0
}

function buildHaystack(o: Ord): string {
  return [
    o.tittel,
    o.undertittel ?? '',
    ...(o.alias ?? []),
    o.forklaring,
    o.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

export function searchOrd(
  mini: MiniSearch<IndexedOrd>,
  byId: Map<string, Ord>,
  raw: string,
): Ord[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const parsed = parseQuery(trimmed)
  const queryParts = [...parsed.phrases, ...parsed.terms].join(' ').trim()
  if (!queryParts) return []

  const hits = mini.search(queryParts, { combineWith: parsed.combineWith })
  let withScore = hits.map(h => {
    const o = byId.get(String(h.id))
    return o ? { o, miniScore: h.score ?? 0 } : null
  }).filter((x): x is { o: Ord; miniScore: number } => !!x)

  // Sitert frase må forekomme bokstavelig i ett av feltene.
  if (parsed.phrases.length > 0) {
    const lowerPhrases = parsed.phrases.map(p => p.toLowerCase())
    withScore = withScore.filter(({ o }) => {
      const hay = buildHaystack(o)
      return lowerPhrases.every(p => hay.includes(p))
    })
  }

  // Rå-spørringen brukes til eksakt-match-løftet, slik at "AI" → alias
  // "AI" gir 8000 ekstra og dyttes til topp uansett miniSearch-score.
  const exactKey = parsed.phrases.length === 1 && parsed.terms.length === 0
    ? parsed.phrases[0]
    : parsed.terms.length === 1 && parsed.phrases.length === 0
      ? parsed.terms[0]
      : trimmed.replace(/"/g, '')

  withScore.sort((a, b) => {
    const ea = exactScore(a.o, exactKey)
    const eb = exactScore(b.o, exactKey)
    if (ea !== eb) return eb - ea
    return b.miniScore - a.miniScore
  })

  return withScore.map(x => x.o)
}
