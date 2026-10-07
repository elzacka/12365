import { useState, useMemo, useEffect, use, useCallback, useRef } from 'react'
import { fetchOppslagsverk } from '../data/loader'
import { buildIndex, searchOrd } from '../data/searchIndex'
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import { SearchIcon, CloseIcon, ChevronRightIcon } from '../components/Icons'
import { SearchShortcutHint } from '../components/SearchShortcutHint'
import { parseInline, stripLinks } from '../lib/inline'
import type { Oppslag } from '../types'

const SEARCH_WORDS = ['ord', 'beskrivelse', 'emneknagg']

function firstLetter(s: string): string {
  return s.charAt(0).toLocaleUpperCase('nb')
}


function hasAllTags(o: Oppslag, tags: string[]): boolean {
  return tags.every(t => o.tags.includes(t))
}

// «ki», «ki og metode», «ki, metode og analyse»
function joinTags(tags: string[]): string {
  if (tags.length < 2) return tags.join('')
  return `${tags.slice(0, -1).join(', ')} og ${tags[tags.length - 1]}`
}

function normalizeForCompare(s: string): string {
  return s.toLowerCase().replace(/[^a-zæøå0-9]/g, '')
}

function visibleAliases(ord: Oppslag): string[] {
  if (!ord.alias) return []
  const titNorm = normalizeForCompare(ord.tittel)
  return ord.alias.filter(a => normalizeForCompare(a) !== titNorm)
}

export function Oppslagsverk() {
  const ord = use(fetchOppslagsverk())
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const placeholder = useRotatingPlaceholder('Søk i', SEARCH_WORDS)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isDesktopSearch = useSearchShortcut(searchInputRef)

  const index = useMemo(() => buildIndex(ord), [ord])
  const byId = useMemo(() => new Map(ord.map(o => [o.id, o])), [ord])

  // Read ?o=<id> once when first rendering with data. Validated against
  // current oppslagsverk so a stale link doesn't expand a phantom row.
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

  // ESC kollapser ekspandert rad eller fjerner alle tag-filtre.
  const hasTagFilter = activeTags.length > 0
  useEffect(() => {
    if (!expandedId && !hasTagFilter) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (expandedId) setExpandedId(null)
      else setActiveTags([])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedId, hasTagFilter])

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
    if (!q || activeTags.includes(q)) return null
    return allTags.has(q) ? q : null
  }, [query, allTags, activeTags])

  const filteredByTag = useMemo<Oppslag[]>(() => {
    if (activeTags.length === 0) return ord
    return ord.filter(o => hasAllTags(o, activeTags))
  }, [ord, activeTags])

  const results = useMemo<Oppslag[] | null>(() => {
    const trimmed = query.trim()
    if (!trimmed) return null

    // Én bokstav: vis alle ord som starter på den bokstaven, alfabetisk.
    // Ingen fuzzy eller score – brukeren blar, ikke søker ennå.
    if (trimmed.length === 1) {
      const letter = trimmed.toLowerCase()
      return filteredByTag
        .filter(o => o.tittel.charAt(0).toLowerCase() === letter)
        .sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb'))
    }

    const list = searchOrd(index, byId, trimmed)
    if (activeTags.length === 0) return list
    return list.filter(o => hasAllTags(o, activeTags))
  }, [query, index, byId, activeTags, filteredByTag])

  const visibleCount = results?.length ?? filteredByTag.length

  const grouped = useMemo(() => {
    const map = new Map<string, Oppslag[]>()
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
      ] as [string, Oppslag[]])
  }, [filteredByTag])

  const handleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setActiveTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
    setExpandedId(null)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }, [])

  const removeTag = useCallback((tag: string) => {
    setActiveTags(prev => prev.filter(t => t !== tag))
  }, [])

  const clearTags = useCallback(() => {
    setActiveTags([])
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="search"
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="search"
              className={`w-full pl-10 ${isDesktopSearch && !query ? 'pr-16' : 'pr-4'} py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm`}
              aria-label="Søk i oppslagsverket"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Tøm søk"
              >
                <CloseIcon size={16} />
              </button>
            ) : (
              isDesktopSearch && <SearchShortcutHint />
            )}
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-slate-500 tabular-nums" aria-live="polite">
              {visibleCount} oppslag
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(v => !v)}
              aria-expanded={showHelp}
              aria-controls="oppslagsverk-tips"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Veiledning
              <ChevronRightIcon
                size={12}
                className={`transition-transform duration-150 ${showHelp ? '-rotate-90' : 'rotate-90'}`}
              />
            </button>
          </div>

          {showHelp && (
            <div
              id="oppslagsverk-tips"
              className="mt-1 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3"
            >
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium mb-1.5">I søkefeltet, eksempler:</p>
                  <div className="space-y-2">
                    {([
                      { kode: 'S', beskrivelse: 'viser alle oppslag som begynner med S' },
                      { kode: 'metadata', beskrivelse: 'viser alle oppslag med «metadata» i tittel eller forklaring' },
                      { kode: 'teams', beskrivelse: 'viser alle oppslag med emneknaggen #teams' },
                    ] as const).map(({ kode, beskrivelse }) => (
                      <div key={kode} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <code className="font-mono bg-slate-100 text-slate-700 rounded px-1 py-0.5 whitespace-nowrap">
                          {kode}
                        </code>
                        <span className="text-slate-500">→ {beskrivelse}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-400 font-medium mb-1.5">I listen</p>
                  <p className="text-slate-500">Klikk på et oppslag for å se hele forklaringen. Klikk på en emneknagg (#) for å filtrere. Klikk på flere for å se oppslagene som har alle.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {tagShortcut && (
          <button
            onClick={() => {
              setActiveTags(prev => [...prev, tagShortcut])
              setQuery('')
            }}
            className="mb-4 w-full text-left inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors text-xs text-brand-800"
          >
            <span className="text-brand-500">#</span>
            <span>
              Vis alle oppslag merket <strong className="font-semibold">{joinTags([...activeTags, tagShortcut])}</strong>
            </span>
          </button>
        )}

        {hasTagFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Viser oppslag merket</span>
            {activeTags.map(tag => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 hover:bg-brand-200 transition-colors"
                aria-label={`Fjern filter ${tag}`}
              >
                <span>{tag}</span>
                <CloseIcon size={12} />
              </button>
            ))}
          </div>
        )}

        {results !== null ? (
          results.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-base mb-1">
                Fant ikke <em>«{query}»</em>
                {hasTagFilter && <> blant oppslag merket <em>{joinTags(activeTags)}</em></>}
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setActiveTags([])
                }}
                className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
              >
                Vis hele oppslagsverket
              </button>
            </div>
          ) : (
            <OppslagList
              ord={results}
              expandedId={expandedId}
              onExpand={handleExpand}
              onTagClick={handleTagClick}
              activeTags={activeTags}
            />
          )
        ) : (
          <>
            {grouped.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-base mb-1">
                  Ingen oppslag merket <em>{joinTags(activeTags)}</em>
                </p>
                <button
                  onClick={clearTags}
                  className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
                >
                  Vis hele oppslagsverket
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
                    <OppslagList
                      ord={items}
                      expandedId={expandedId}
                      onExpand={handleExpand}
                      onTagClick={handleTagClick}
                      activeTags={activeTags}
                    />
                  </section>
                ))}
              </div>
            )}
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
              aria-label={`Hopp til oppslag som starter med ${letter}`}
            >
              {letter}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

interface OppslagListProps {
  ord: Oppslag[]
  expandedId: string | null
  onExpand: (id: string) => void
  onTagClick: (tag: string) => void
  activeTags: string[]
}

function OppslagList({ ord, expandedId, onExpand, onTagClick, activeTags }: OppslagListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {ord.map((o, idx) => (
        <OppslagRow
          key={o.id}
          ord={o}
          isExpanded={expandedId === o.id}
          onExpand={onExpand}
          onTagClick={onTagClick}
          activeTags={activeTags}
          withBorder={idx < ord.length - 1}
        />
      ))}
    </div>
  )
}

interface OppslagRowProps {
  ord: Oppslag
  isExpanded: boolean
  onExpand: (id: string) => void
  onTagClick: (tag: string) => void
  activeTags: string[]
  withBorder: boolean
}

function OppslagRow({ ord, isExpanded, onExpand, onTagClick, activeTags, withBorder }: OppslagRowProps) {
  const previewText = useMemo(() => {
    const firstLine = stripLinks(ord.forklaring.split('\n')[0])
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
                <p key={i}>{parseInline(line)}</p>
              ))}
          </div>
          {(() => {
            const aliases = visibleAliases(ord)
            if (aliases.length === 0) return null
            const label = 'Også: '
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
                const isActive = activeTags.includes(tag)
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
                      isActive
                        ? `Fjern filter ${tag}`
                        : activeTags.length > 0
                          ? `Legg til filter ${tag}`
                          : `Vis alle oppslag merket ${tag}`
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
