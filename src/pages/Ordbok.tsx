import { useState, useMemo, useEffect, use, useCallback } from 'react'
import { fetchOrdbok } from '../data/loader'
import { buildIndex, searchOrd } from '../data/searchIndex'
import { useSeenVersions } from '../lib/SeenVersionsContext'
import { SearchIcon, CloseIcon } from '../components/Icons'
import type { Ord } from '../types'

function firstLetter(s: string): string {
  return s.charAt(0).toLocaleUpperCase('nb')
}

// Oppføringer der tittelen allerede står på engelsk, slik at en
// "Eng."-etikett på alias-linjen blir villedende. Liste er begrenset
// til ord som faktisk har engelsk tittel i ordboken.
const ENGLISH_TITLE_FIRST_WORDS = new Set([
  'black',
  'business',
  'cambridge',
  'citizen',
  'data',
  'mash',
  'page',
  'quantified',
  'sample',
  'staging',
])

function isEnglishTittel(tittel: string): boolean {
  if (/[æøå]/i.test(tittel)) return false
  const firstWord = tittel.toLowerCase().split(/[\s-]+/)[0]
  return ENGLISH_TITLE_FIRST_WORDS.has(firstWord)
}

function normalizeForCompare(s: string): string {
  return s.toLowerCase().replace(/[^a-zæøå0-9]/g, '')
}

function visibleAliases(ord: Ord): string[] {
  if (!ord.alias) return []
  const titNorm = normalizeForCompare(ord.tittel)
  return ord.alias.filter(a => normalizeForCompare(a) !== titNorm)
}

export function Ordbok() {
  const ord = use(fetchOrdbok())
  const { markAllOrdbokSeen } = useSeenVersions()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Et besøk på ordbok-siden teller som "lest" for alle oppføringer slik at
  // prikken på Ordbok-kortet på Home forsvinner.
  useEffect(() => {
    markAllOrdbokSeen()
  }, [markAllOrdbokSeen])

  const index = useMemo(() => buildIndex(ord), [ord])
  const byId = useMemo(() => new Map(ord.map(o => [o.id, o])), [ord])

  // Read ?o=<id> once when first rendering with data. Validated against
  // current ordbok so a stale link doesn't expand a phantom row.
  const initialExpandedId = useMemo<string | null>(() => {
    if (typeof window === 'undefined') return null
    const o = new URLSearchParams(window.location.search).get('o')
    return o && byId.has(o) ? o : null
  }, [byId])

  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId)

  // Scroll the deep-linked ord into view on first mount.
  useEffect(() => {
    if (!initialExpandedId) return
    const el = document.getElementById(`ord-${initialExpandedId}`)
    if (!el) return
    requestAnimationFrame(() => el.scrollIntoView({ block: 'center' }))
  }, [initialExpandedId])

  // Mirror expandedId into URL with replaceState so back-knappen ikke
  // forsøples med hver ekspandering.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (expandedId) {
      url.searchParams.set('o', expandedId)
    } else {
      url.searchParams.delete('o')
    }
    window.history.replaceState(window.history.state, '', url)
  }, [expandedId])

  // ESC kollapser ekspandert rad eller fjerner aktivt tag-filter.
  useEffect(() => {
    if (!expandedId && !activeTag) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (expandedId) setExpandedId(null)
      else if (activeTag) setActiveTag(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedId, activeTag])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const o of ord) for (const t of o.tags) set.add(t)
    return set
  }, [ord])

  // Hvis brukeren skriver noe som er identisk med en av tag-navnene
  // (f.eks. "analyse"), tilbyr vi en snarvei til å filtrere på taggen
  // i stedet for fritekstsøk.
  const tagShortcut = useMemo<string | null>(() => {
    const q = query.trim().toLowerCase()
    if (!q || activeTag === q) return null
    return allTags.has(q) ? q : null
  }, [query, allTags, activeTag])

  const filteredByTag = useMemo<Ord[]>(() => {
    if (!activeTag) return ord
    return ord.filter(o => o.tags.includes(activeTag))
  }, [ord, activeTag])

  const results = useMemo<Ord[] | null>(() => {
    const trimmed = query.trim()
    if (!trimmed) return null

    // Én bokstav: vis alle ord som starter på den bokstaven, alfabetisk.
    // Ingen fuzzy eller score – brukeren blar, ikke søker ennå.
    if (trimmed.length === 1) {
      const letter = trimmed.toLowerCase()
      const source = activeTag ? ord.filter(o => o.tags.includes(activeTag)) : ord
      return source
        .filter(o => o.tittel.charAt(0).toLowerCase() === letter)
        .sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb'))
    }

    const list = searchOrd(index, byId, trimmed)
    if (!activeTag) return list
    return list.filter(o => o.tags.includes(activeTag))
  }, [query, index, byId, activeTag, ord])

  const grouped = useMemo(() => {
    const map = new Map<string, Ord[]>()
    for (const o of filteredByTag) {
      const key = firstLetter(o.tittel)
      const bucket = map.get(key)
      if (bucket) bucket.push(o)
      else map.set(key, [o])
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'nb'))
      .map(([letter, items]) => [
        letter,
        [...items].sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb')),
      ] as [string, Ord[]])
  }, [filteredByTag])

  const handleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag(prev => (prev === tag ? null : tag))
    setExpandedId(null)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }, [])

  const clearActiveTag = useCallback(() => {
    setActiveTag(null)
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk ord ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="search"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            aria-label="Søk i ordboken"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Tøm søk"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {tagShortcut && (
          <button
            onClick={() => {
              setActiveTag(tagShortcut)
              setQuery('')
            }}
            className="mb-4 w-full text-left inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors text-xs text-brand-800"
          >
            <span className="text-brand-500">#</span>
            <span>
              Vis alle ord merket <strong className="font-semibold">{tagShortcut}</strong>
            </span>
          </button>
        )}

        {activeTag && (
          <div className="mb-4 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Viser ord merket</span>
            <button
              onClick={clearActiveTag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 hover:bg-brand-200 transition-colors"
              aria-label={`Fjern filter ${activeTag}`}
            >
              <span>{activeTag}</span>
              <CloseIcon size={12} />
            </button>
          </div>
        )}

        {results !== null ? (
          results.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-base mb-1">
                Fant ikke <em>«{query}»</em>
                {activeTag && <> blant ord merket <em>{activeTag}</em></>}
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setActiveTag(null)
                }}
                className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
              >
                Vis hele ordboken
              </button>
            </div>
          ) : (
            <>
              <p className="sr-only" aria-live="polite">
                {results.length} treff
              </p>
              <OrdList
                ord={results}
                expandedId={expandedId}
                onExpand={handleExpand}
                onTagClick={handleTagClick}
                activeTag={activeTag}
              />
            </>
          )
        ) : (
          <>
            {grouped.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-base mb-1">
                  Ingen ord merket <em>{activeTag}</em>
                </p>
                <button
                  onClick={clearActiveTag}
                  className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
                >
                  Vis hele ordboken
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {grouped.map(([letter, items]) => (
                  <section key={letter} aria-labelledby={`grp-h-${letter}`} id={`grp-${letter}`}>
                    <div className="mb-2 px-1">
                      <h2
                        id={`grp-h-${letter}`}
                        className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {letter}
                      </h2>
                    </div>
                    <OrdList
                      ord={items}
                      expandedId={expandedId}
                      onExpand={handleExpand}
                      onTagClick={handleTagClick}
                      activeTag={activeTag}
                    />
                  </section>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500 text-center mt-6">
              {filteredByTag.length} {filteredByTag.length === 1 ? 'ord' : 'ord'}
              {activeTag && ' i denne kategorien'}
            </p>
          </>
        )}
      </main>

      {results === null && grouped.length > 0 && (
        <nav
          aria-label="Hopp til bokstav"
          className="hidden sm:flex fixed right-2 top-1/2 -translate-y-1/2 flex-col gap-0.5 z-20 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200 px-1 py-2 shadow-sm"
        >
          {grouped.map(([letter]) => (
            <a
              key={letter}
              href={`#grp-${letter}`}
              className="text-xs text-slate-500 hover:text-brand-700 w-5 h-5 flex items-center justify-center transition-colors"
              aria-label={`Hopp til ord som starter med ${letter}`}
            >
              {letter}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

interface OrdListProps {
  ord: Ord[]
  expandedId: string | null
  onExpand: (id: string) => void
  onTagClick: (tag: string) => void
  activeTag: string | null
}

function OrdList({ ord, expandedId, onExpand, onTagClick, activeTag }: OrdListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {ord.map((o, idx) => (
        <OrdRow
          key={o.id}
          ord={o}
          isExpanded={expandedId === o.id}
          onExpand={onExpand}
          onTagClick={onTagClick}
          activeTag={activeTag}
          withBorder={idx < ord.length - 1}
        />
      ))}
    </div>
  )
}

interface OrdRowProps {
  ord: Ord
  isExpanded: boolean
  onExpand: (id: string) => void
  onTagClick: (tag: string) => void
  activeTag: string | null
  withBorder: boolean
}

function OrdRow({ ord, isExpanded, onExpand, onTagClick, activeTag, withBorder }: OrdRowProps) {
  const previewText = useMemo(() => {
    const firstLine = ord.forklaring.split('\n')[0]
    return firstLine.length > 140 ? firstLine.slice(0, 140).trim() + '…' : firstLine
  }, [ord.forklaring])

  return (
    <div
      id={`ord-${ord.id}`}
      className={`${withBorder ? 'border-b border-slate-100' : ''} ${isExpanded ? 'bg-brand-50/60' : ''} transition-colors`}
    >
      <button
        onClick={() => onExpand(ord.id)}
        className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`ord-body-${ord.id}`}
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-800 leading-snug">{ord.tittel}</span>
          {!isExpanded && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-snug">
              {previewText}
            </p>
          )}
        </div>
      </button>
      {isExpanded && (
        <div
          id={`ord-body-${ord.id}`}
          className="px-4 pb-4 pt-0 text-sm text-slate-700 leading-relaxed"
        >
          <div className="space-y-2">
            {ord.forklaring
              .split('\n')
              .map(l => l.trim())
              .filter(Boolean)
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>
          {(() => {
            const aliases = visibleAliases(ord)
            if (aliases.length === 0) return null
            const label = isEnglishTittel(ord.tittel) ? 'Også: ' : 'Alt.: '
            return (
              <p className="mt-3 text-xs text-slate-500">
                <span className="text-slate-400">{label}</span>
                {aliases.join(', ')}
              </p>
            )
          })()}
          {ord.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ord.tags.map(tag => {
                const isActive = activeTag === tag
                return (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className={`inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-transparent hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300'
                    }`}
                    aria-pressed={isActive}
                    aria-label={
                      isActive ? `Fjern filter ${tag}` : `Vis alle ord merket ${tag}`
                    }
                  >
                    <span aria-hidden="true" className={isActive ? 'opacity-60' : 'opacity-35'}>#</span>
                    {tag}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
