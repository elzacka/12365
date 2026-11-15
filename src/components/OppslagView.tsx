import { Fragment, useState, useMemo, useEffect, useCallback, useId, useRef } from 'react'
import { buildIndex, searchOrd } from '../data/searchIndex'
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import { SearchIcon, CloseIcon, ChevronRightIcon } from './Icons'
import { SearchShortcutHint } from './SearchShortcutHint'
import { KeyLegend, KeyNotation, Keys } from './Keys'
import { parseInline, stripLinks } from '../lib/inline'
import type { Oppslag, OppslagGroup } from '../types'

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

// [id, heading, entries]
type Group = [string, string, Oppslag[]]

// A group's entries under its subheadings, in their order; entries without one come first.
function bySubgroup(items: Oppslag[], order: string[] = []): [string | null, Oppslag[]][] {
  const parts: [string | null, Oppslag[]][] = [[null, items.filter(o => !o.undergruppe || !order.includes(o.undergruppe))]]
  for (const sub of order) parts.push([sub, items.filter(o => o.undergruppe === sub)])
  return parts.filter(([, list]) => list.length > 0)
}

function alphabetical(list: Oppslag[]): Oppslag[] {
  return [...list].sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb'))
}

// Each entry under its first tag, groups in the given order, entries in list order.
function groupByTag(list: Oppslag[], groups: OppslagGroup[]): Group[] {
  return groups
    .map(g => [g.tag, g.title, list.filter(o => o.tags[0] === g.tag)] as Group)
    .filter(([, , items]) => items.length > 0)
}

function normalizeForCompare(s: string): string {
  return s.toLowerCase().replace(/[^a-zæøå0-9]/g, '')
}

function visibleAliases(ord: Oppslag): string[] {
  if (!ord.alias) return []
  const titNorm = normalizeForCompare(ord.tittel)
  return ord.alias.filter(a => normalizeForCompare(a) !== titNorm)
}

export interface SearchExample {
  kode: string
  beskrivelse: string
}

interface OppslagViewProps {
  ord: Oppslag[]
  /** Words the search placeholder rotates through: «Søk i …». */
  placeholderWords: string[]
  searchLabel: string
  examples: SearchExample[]
  resetLabel: string
  /** Group by first tag, in this order, instead of by first letter. */
  groups?: OppslagGroup[]
  /** Line 1 of `forklaring` is a key combination, shown as keys beside the title. */
  keys?: boolean
}

// Searchable, tag-filtered list shared by Jukselapp and Hurtigtaster.
export function OppslagView({ ord, placeholderWords, searchLabel, examples, resetLabel, groups, keys = false }: OppslagViewProps) {
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  // A subheading inside one group: Lysbilder in PowerPoint. Any other tag change clears it.
  const [activeSub, setActiveSub] = useState<{ tag: string; sub: string } | null>(null)
  const setTags = useCallback((next: string[] | ((prev: string[]) => string[])) => {
    setActiveSub(null)
    setActiveTags(next)
  }, [])
  const [showHelp, setShowHelp] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const placeholder = useRotatingPlaceholder('Søk i', placeholderWords)
  const helpId = useId()
  const filterId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isDesktopSearch = useSearchShortcut(searchInputRef)

  const index = useMemo(() => buildIndex(ord), [ord])
  const byId = useMemo(() => new Map(ord.map(o => [o.id, o])), [ord])

  // Read ?o=<id> once when first rendering with data. Validated against
  // the current entries so a stale link doesn't expand a phantom row.
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

  // Esc empties the search field first, then collapses the open row, then clears the tag filter.
  const hasTagFilter = activeTags.length > 0
  useEffect(() => {
    if (!expandedId && !hasTagFilter) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const input = searchInputRef.current
      if (e.target === input && input?.value) setQuery('')
      else if (expandedId) setExpandedId(null)
      else setTags([])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedId, hasTagFilter, setTags])

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
    // A grouped list filters on one section, so a second app would show nothing.
    if (!q || activeTags.includes(q) || (groups && activeTags.length > 0)) return null
    return allTags.has(q) ? q : null
  }, [query, allTags, activeTags, groups])

  // Subheadings that contain the query, from three letters: «lysbi» offers Lysbilder in PowerPoint.
  // None with an app filter on: the list already shows that app.
  const subShortcuts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 3 || !groups || activeTags.length > 0) return []
    return groups.flatMap(g => (g.undergrupper ?? [])
      .filter(sub => sub.toLowerCase().includes(q))
      .map(sub => ({ tag: g.tag, title: g.title, sub })))
  }, [query, groups, activeTags])

  // In a grouped list a tag is an app: show its title, «i Excel», not «merket excel».
  const tagName = useCallback((tag: string) => groups?.find(g => g.tag === tag)?.title ?? tag, [groups])
  const activeNames = joinTags(activeTags.map(tagName))
  const tagPrefix = groups ? 'i' : 'merket'

  const chipGroups = useMemo(
    () => (groups ? [...groups].sort((a, b) => a.title.localeCompare(b.title, 'nb')) : []),
    [groups],
  )

  // In a grouped list a tag is a section: the entry's first tag, so Windows leaves out Internasjonale tegn.
  const matches = useCallback(
    (o: Oppslag) => (groups ? activeTags.every(t => o.tags[0] === t) : hasAllTags(o, activeTags))
      && (!activeSub || o.undergruppe === activeSub.sub),
    [groups, activeTags, activeSub],
  )

  const filteredByTag = useMemo<Oppslag[]>(() => {
    if (activeTags.length === 0) return ord
    return ord.filter(matches)
  }, [ord, activeTags, matches])

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
    // A tag filter makes the hits a list to browse; app sections keep their rank.
    const filtered = list.filter(matches)
    return groups ? filtered : alphabetical(filtered)
  }, [query, index, byId, activeTags, filteredByTag, matches, groups])

  const visibleCount = results?.length ?? filteredByTag.length
  const isFiltering = results !== null || hasTagFilter
  const isSearching = results !== null
  const trimmedQuery = query.trim()

  // Same sentence as the visible filter line, without the chips' button labels.
  const filterSummary = !isFiltering
    ? ''
    : visibleCount === 0
      ? 'Ingen treff'
      : [
          isSearching ? `${visibleCount} treff på «${trimmedQuery}»` : `${visibleCount} oppslag`,
          hasTagFilter && `${isSearching && !groups ? 'blant oppslag ' : ''}${tagPrefix} ${activeNames}`,
          activeSub && `under ${activeSub.sub}`,
        ].filter(Boolean).join(' ')

  const grouped = useMemo<Group[]>(() => {
    if (groups) return groupByTag(filteredByTag, groups).map(([id, heading, items]) => [id, heading, alphabetical(items)])
    const map = new Map<string, Oppslag[]>()
    for (const o of filteredByTag) {
      const key = firstLetter(o.tittel)
      const bucket = map.get(key)
      if (bucket) bucket.push(o)
      else map.set(key, [o])
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'nb'))
      .map(([letter, items]) => [letter, letter, alphabetical(items)])
  }, [filteredByTag, groups])

  // Search hits keep their rank inside each group.
  const resultGroups = useMemo(
    () => (groups && results ? groupByTag(results, groups) : null),
    [groups, results],
  )

  // Search hits keep their rank, so subheadings only split the browsed list.
  const renderGroups = (list: Group[], subheadings: boolean) => (
    <div className="space-y-5">
      {list.map(([id, heading, items]) => (
        <section key={id} aria-labelledby={`grp-h-${id}`} id={`grp-${id}`}>
          <div className="mb-2 px-1">
            <h2
              id={`grp-h-${id}`}
              className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
            >
              {heading}
            </h2>
          </div>
          <div className="space-y-3">
            {bySubgroup(items, subheadings ? groups?.find(g => g.tag === id)?.undergrupper : undefined).map(([sub, list]) => (
              <div key={sub ?? ''}>
                {sub && <h3 className="mb-1.5 px-1 text-xs font-semibold text-slate-500">{sub}</h3>}
                <OppslagList
                  ord={list}
                  keys={keys}
                  expandedId={expandedId}
                  onExpand={handleExpand}
                  onTagClick={handleTagClick}
                  activeTags={activeTags}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )

  const handleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }, [])

  // The clicked entry has the tag, so it stays in the filtered list: keep it
  // open and in view so more tags can be picked from it.
  const handleTagClick = useCallback((id: string, tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
    requestAnimationFrame(() => {
      document.getElementById(`ord-${id}`)?.scrollIntoView({ block: 'nearest' })
    })
  }, [setTags])

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }, [setTags])

  const clearTags = useCallback(() => {
    setTags([])
  }, [setTags])

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
              className={`w-full pl-10 ${isDesktopSearch && !query ? 'pr-16' : 'pr-4'} py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm`}
              aria-label={searchLabel}
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                aria-label="Tøm søk"
              >
                <CloseIcon size={16} />
              </button>
            ) : (
              isDesktopSearch && <SearchShortcutHint />
            )}
          </div>

          <div className="flex items-center justify-end gap-4 mt-1.5">
            <p className="sr-only" aria-live="polite">{filterSummary}</p>
            {groups && (
              <button
                type="button"
                onClick={() => setShowFilter(v => !v)}
                aria-expanded={showFilter}
                aria-controls={filterId}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Filtrer på app
                <ChevronRightIcon
                  size={12}
                  className={`transition-transform duration-150 ${showFilter ? '-rotate-90' : 'rotate-90'}`}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowHelp(v => !v)}
              aria-expanded={showHelp}
              aria-controls={helpId}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Veiledning
              <ChevronRightIcon
                size={12}
                className={`transition-transform duration-150 ${showHelp ? '-rotate-90' : 'rotate-90'}`}
              />
            </button>
          </div>

          {groups && showFilter && (
            <div
              id={filterId}
              role="group"
              aria-label="Filtrer på app"
              className="mt-1 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-3 flex flex-wrap gap-1.5"
            >
              {chipGroups.map(g => {
                const isActive = activeTags.length === 1 && activeTags[0] === g.tag
                return (
                  <button
                    key={g.tag}
                    type="button"
                    onClick={() => setTags(isActive ? [] : [g.tag])}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                    aria-pressed={isActive}
                  >
                    {g.title}
                  </button>
                )
              })}
            </div>
          )}

          {showHelp && (
            <div
              id={helpId}
              className="mt-1 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3"
            >
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-500 font-medium mb-1.5">Eksempler på søk:</p>
                  <div className="space-y-2">
                    {examples.map(({ kode, beskrivelse }) => (
                      <div key={kode} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <code className="font-mono bg-slate-100 text-slate-700 rounded px-1 py-0.5 whitespace-nowrap">
                          {kode}
                        </code>
                        <span className="text-slate-500">→ {beskrivelse}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {keys && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-slate-500 font-medium mb-1.5">Symbolene på tastene</p>
                    <KeyLegend />
                    <p className="text-slate-500 font-medium mt-3 mb-1">Slik trykker du</p>
                    <p className="text-slate-500 mb-1.5">Tastene gjelder en bærbar PC med norsk tastatur uten talltastatur, og Microsoft 365 på norsk. På engelsk er noen taster annerledes, for eksempel Ctrl+B for fet skrift. Du kan bruke egne taster for Page up, Page down, Home og End hvis tastaturet har dem.</p>
                    <KeyNotation />
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500 font-medium mb-1.5">I listen</p>
                  <p className="text-slate-500">
                    {keys
                      ? 'Åpne «Filtrer på app» og trykk på en app, for eksempel «Excel», for å se bare hurtigtastene i den. Trykk på den igjen for å se alle.'
                      : 'Klikk på et oppslag for å se hele forklaringen. Klikk på en emneknagg (#) for å filtrere. Klikk på flere for å se oppslagene som har alle.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {tagShortcut && (
          <button
            onClick={() => {
              setTags(prev => [...prev, tagShortcut])
              setQuery('')
            }}
            className="mb-4 w-full text-left inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors text-xs text-brand-800"
          >
            {groups ? (
              <span>
                Vis alt i <strong className="font-semibold">{tagName(tagShortcut)}</strong>
              </span>
            ) : (
              <>
                <span className="text-brand-500">#</span>
                <span>
                  Vis alle oppslag merket <strong className="font-semibold">{joinTags([...activeTags, tagShortcut])}</strong>
                </span>
              </>
            )}
          </button>
        )}

        {subShortcuts.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {subShortcuts.map(({ tag, title, sub }) => (
              <button
                key={`${tag}-${sub}`}
                onClick={() => {
                  setActiveTags([tag])
                  setActiveSub({ tag, sub })
                  setQuery('')
                }}
                className="w-full text-left inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors text-xs text-brand-800"
              >
                <span>
                  Vis alt under <strong className="font-semibold">{sub}</strong> i {title}
                </span>
              </button>
            ))}
          </div>
        )}

        {isFiltering && visibleCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs text-slate-500">
            <span className="min-w-0 break-words">
              <strong className="font-semibold text-slate-700 tabular-nums">{visibleCount}</strong>
              {isSearching ? <> treff på «{trimmedQuery}»</> : ' oppslag'}
              {hasTagFilter && (isSearching && !groups ? ' blant oppslag merket' : ` ${tagPrefix}`)}
            </span>
            {hasTagFilter && (
              <>
                {activeTags.map((tag, i) => (
                  <Fragment key={tag}>
                    <span className="inline-flex items-center">
                      <button
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 hover:bg-brand-200 transition-colors"
                        aria-label={`Fjern filter ${tagName(tag)}`}
                      >
                        <span>{tagName(tag)}</span>
                        <CloseIcon size={12} />
                      </button>
                      {i < activeTags.length - 2 && ','}
                    </span>
                    {i === activeTags.length - 2 && <span>og</span>}
                  </Fragment>
                ))}
              </>
            )}
            {activeSub && (
              <>
                <span>under</span>
                <button
                  onClick={() => setActiveSub(null)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 hover:bg-brand-200 transition-colors"
                  aria-label={`Fjern filter ${activeSub.sub}`}
                >
                  <span>{activeSub.sub}</span>
                  <CloseIcon size={12} />
                </button>
              </>
            )}
          </div>
        )}

        {results !== null ? (
          results.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-base mb-1">
                Fant ikke <em>«{query}»</em>
                {hasTagFilter && (groups
                  ? <> i <em>{activeNames}</em></>
                  : <> blant oppslag merket <em>{joinTags(activeTags)}</em></>)}
              </p>
              {/* With an app filter on, keep the query and widen the search to every app. */}
              <button
                onClick={() => {
                  if (!groups || !hasTagFilter) setQuery('')
                  setTags([])
                }}
                className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
              >
                {groups && hasTagFilter ? 'Søk i alle appene' : resetLabel}
              </button>
            </div>
          ) : resultGroups ? (
            renderGroups(resultGroups, false)
          ) : (
            <OppslagList
              ord={results}
              keys={keys}
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
                  {resetLabel}
                </button>
              </div>
            ) : (
              renderGroups(grouped, true)
            )}
          </>
        )}
      </main>

      {!groups && results === null && grouped.length > 0 && (
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
  keys: boolean
  expandedId: string | null
  onExpand: (id: string) => void
  onTagClick: (id: string, tag: string) => void
  activeTags: string[]
}

function OppslagList({ ord, keys, expandedId, onExpand, onTagClick, activeTags }: OppslagListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {ord.map((o, idx) => (
        keys ? (
          <KeyRow key={o.id} ord={o} withBorder={idx < ord.length - 1} />
        ) : (
          <OppslagRow
            key={o.id}
            ord={o}
            isExpanded={expandedId === o.id}
            onExpand={onExpand}
            onTagClick={onTagClick}
            activeTags={activeTags}
            withBorder={idx < ord.length - 1}
          />
        )
      ))}
    </div>
  )
}

interface TagChipsProps {
  ord: Oppslag
  onTagClick: (id: string, tag: string) => void
  activeTags: string[]
}

function TagChips({ ord, onTagClick, activeTags }: TagChipsProps) {
  return (
    <>
      {ord.tags.map(tag => {
        const isActive = activeTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onTagClick(ord.id, tag)}
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
    </>
  )
}

interface KeyRowProps {
  ord: Oppslag
  withBorder: boolean
}

// Description and keys on one line. The app tag is searchable but not shown.
function KeyRow({ ord, withBorder }: KeyRowProps) {
  return (
    <div
      id={`ord-${ord.id}`}
      className={`${withBorder ? 'border-b border-slate-100' : ''} px-4 py-3 [content-visibility:auto] [contain-intrinsic-size:auto_76px]`}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 min-w-0 text-sm text-slate-800 leading-snug">{ord.tittel}</p>
        <div className="shrink-0 max-w-[50%] text-right">
          <Keys text={ord.forklaring} />
        </div>
      </div>
    </div>
  )
}

interface OppslagRowProps {
  ord: Oppslag
  isExpanded: boolean
  onExpand: (id: string) => void
  onTagClick: (id: string, tag: string) => void
  activeTags: string[]
  withBorder: boolean
}

function OppslagRow({ ord, isExpanded, onExpand, onTagClick, activeTags, withBorder }: OppslagRowProps) {
  const previewText = useMemo(() => {
    const firstLine = stripLinks(ord.forklaring.split('\n')[0])
    return firstLine.length > 140 ? firstLine.slice(0, 140).trim() + '…' : firstLine
  }, [ord.forklaring])
  const aliases = visibleAliases(ord)

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
              {parseInline(previewText)}
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
          {aliases.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              <span className="font-medium">Også: </span>
              {aliases.join(', ')}
            </p>
          )}
          {ord.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <TagChips ord={ord} onTagClick={onTagClick} activeTags={activeTags} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
