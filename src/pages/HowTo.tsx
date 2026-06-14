import { useState, useMemo, use, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'
import { buildArticleIndex, searchArticles, type ArticleSearchHit } from '../data/articleSearchIndex'
import { ChevronRightIcon, SearchIcon, CloseIcon } from '../components/Icons'
import { UpdateDot } from '../components/UpdateDot'
import { useSeenVersions } from '../lib/SeenVersionsContext'

export function HowTo() {
  const publicCategories = use(fetchArticles())
  const rawCategories = useMergedArticles(publicCategories)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const { isArticleNew } = useSeenVersions()

  const allCategories = useMemo(
    () =>
      rawCategories
        .map(cat => ({ ...cat, artikler: cat.artikler.filter(a => !a.skjult) }))
        .filter(cat => cat.artikler.length > 0),
    [rawCategories],
  )

  const index = useMemo(() => buildArticleIndex(allCategories), [allCategories])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const cat of allCategories)
      for (const a of cat.artikler)
        for (const t of a.tags) set.add(t)
    return set
  }, [allCategories])

  const tagShortcut = useMemo<string | null>(() => {
    const q = query.trim().toLowerCase()
    if (!q || activeTag === q) return null
    return allTags.has(q) ? q : null
  }, [query, allTags, activeTag])

  useEffect(() => {
    if (!query && !activeTag) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (query) setQuery('')
      else if (activeTag) setActiveTag(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [query, activeTag])

  const filteredByTag = useMemo(() => {
    if (!activeTag) return allCategories
    return allCategories
      .map(cat => ({
        ...cat,
        artikler: cat.artikler.filter(a => a.tags.includes(activeTag)),
      }))
      .filter(cat => cat.artikler.length > 0)
  }, [allCategories, activeTag])

  const searchHits = useMemo<Map<string, number> | null>(() => {
    const trimmed = query.trim()
    if (!trimmed) return null
    const hits: ArticleSearchHit[] = searchArticles(index, trimmed)
    return new Map(hits.map(h => [h.id, h.score]))
  }, [query, index])

  const totalSearchResults = useMemo(
    () => (searchHits ? searchHits.size : null),
    [searchHits],
  )

  const categories = useMemo(() => {
    if (searchHits === null) return filteredByTag
    const base = activeTag ? filteredByTag : allCategories

    // Filtrer til treff og sorter artikler etter score innenfor hver kategori
    const scored = base
      .map(cat => ({
        ...cat,
        artikler: cat.artikler
          .filter(a => searchHits.has(a.id))
          .sort((a, b) => (searchHits.get(b.id) ?? 0) - (searchHits.get(a.id) ?? 0)),
      }))
      .filter(cat => cat.artikler.length > 0)

    // Sorter kategorier etter beste artikkelscoren i kategorien
    scored.sort((a, b) => {
      const scoreA = searchHits.get(a.artikler[0]?.id ?? '') ?? 0
      const scoreB = searchHits.get(b.artikler[0]?.id ?? '') ?? 0
      return scoreB - scoreA
    })

    return scored
  }, [searchHits, filteredByTag, allCategories, activeTag])

  const totalArticles = allCategories.reduce((sum, k) => sum + k.artikler.length, 0)

  const clearActiveTag = useCallback(() => setActiveTag(null), [])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter veiledning ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="search"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            aria-label="Søk i veiledninger"
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
              Vis alle veiledninger merket <strong className="font-semibold">{tagShortcut}</strong>
            </span>
          </button>
        )}

        {activeTag && (
          <div className="mb-4 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Viser veiledninger merket</span>
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

        {totalSearchResults !== null && (
          <p className="sr-only" aria-live="polite">
            {totalSearchResults} {totalSearchResults === 1 ? 'veiledning' : 'veiledninger'} funnet
          </p>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-base mb-1">
              {query ? (
                <>
                  Fant ikke <em>«{query}»</em>
                  {activeTag && <> blant veiledninger merket <em>{activeTag}</em></>}
                </>
              ) : (
                <>Ingen veiledninger merket <em>{activeTag}</em></>
              )}
            </p>
            <button
              onClick={() => { setQuery(''); setActiveTag(null) }}
              className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
            >
              Vis alle veiledninger
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {categories.map(cat => (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                <div className="mb-2 px-1">
                  <h2 id={`cat-${cat.id}`} className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {cat.tittel}
                  </h2>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {cat.artikler.map((article, idx) => (
                    <Link
                      key={article.id}
                      to={`/slik-gjor-du/${cat.id}/${article.id}`}
                      className={`relative flex items-center gap-3 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group ${
                        idx < cat.artikler.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <UpdateDot visible={isArticleNew(article.id)} className="absolute top-2 right-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-brand-700 transition-colors">
                          {article.tittel}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {article.ingress}
                        </p>
                        {article.tags.length > 0 && activeTag && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {article.tags.map(tag => (
                              <span
                                key={tag}
                                className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  activeTag === tag
                                    ? 'bg-brand-200 text-brand-900'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRightIcon size={18} className="text-slate-300 flex-shrink-0 group-hover:text-brand-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!query && !activeTag && (
          <p className="text-xs text-slate-500 text-center mt-6">
            {totalArticles} veiledninger fordelt på {allCategories.length} kategorier
          </p>
        )}
      </main>
    </div>
  )
}
