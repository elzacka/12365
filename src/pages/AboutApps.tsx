import { useState, useMemo, use } from 'react'
import { fetchCards } from '../data/loader'
import { useMergedCards } from '../auth/merge'
import { FlipCard } from '../components/FlipCard'
import { CheatSheet } from '../components/CheatSheet'
import { ComparisonDrawer } from '../components/ComparisonDrawer'
import { ViewToggle, type AppsView } from '../components/ViewToggle'
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder'
import { SearchIcon, CloseIcon, ChevronRightIcon } from '../components/Icons'

const MAX_COMPARE = 3
const SEARCH_WORDS = ['navn', 'tagline', 'beskrivelse']

export function AboutApps() {
  const publicCards = use(fetchCards())
  const allCards = useMergedCards(publicCards)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<AppsView>('kort')
  const [selected, setSelected] = useState<string[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const placeholder = useRotatingPlaceholder('Søk i', SEARCH_WORDS, searchFocused)

  const filteredCards = useMemo(() => {
    if (!query.trim()) return allCards
    const q = query.toLowerCase()
    return allCards.filter(
      c =>
        c.navn.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        (c.alene ?? '').toLowerCase().includes(q) ||
        (c.sammen ?? '').toLowerCase().includes(q) ||
        (c.oppsummering ?? '').toLowerCase().includes(q)
    )
  }, [query, allCards])

  const toggleCompare = (navn: string) => {
    setSelected(prev =>
      prev.includes(navn)
        ? prev.filter(n => n !== navn)
        : prev.length < MAX_COMPARE
          ? [...prev, navn]
          : prev
    )
  }

  const removeCompare = (navn: string) =>
    setSelected(prev => prev.filter(n => n !== navn))

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex justify-center mb-3">
          <ViewToggle value={view} onChange={setView} />
        </div>

        {view === 'oversikt' && (
          <p className="text-[10px] text-slate-500 text-center mb-4">
            Trykk + for å sammenligne eller ↔ for å gå til en relatert app
          </p>
        )}

        {view === 'kort' && (
          <>
            <div className="mb-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon size={18} />
                </div>
                <input
                  type="search"
                  placeholder={placeholder}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
                  aria-label="Søk i apper"
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

              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowHelp(v => !v)}
                  aria-expanded={showHelp}
                  aria-controls="oversikt-tips"
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
                  id="oversikt-tips"
                  className="mt-1 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3"
                >
                  <p className="text-xs text-slate-500">
                    Trykk på et kort for å se hva appen gjør – alene og i sammenheng med andre
                  </p>
                </div>
              )}
            </div>

            {/* Match count */}
            {query && (
              <p className="text-xs text-slate-500 mb-3 px-1">
                {filteredCards.length === 0
                  ? 'Ingen apper matcher søket ditt.'
                  : `${filteredCards.length} app${filteredCards.length !== 1 ? 'er' : ''} funnet`}
              </p>
            )}

            {filteredCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredCards.map(card => (
                  <FlipCard key={card.navn} card={card} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <p className="text-base mb-1">Ingen apper funnet</p>
                <button
                  onClick={() => setQuery('')}
                  className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
                >
                  Vis alle apper
                </button>
              </div>
            )}

            {!query && (
              <p className="text-xs text-slate-500 text-center mt-6">
                {allCards.length} apper totalt
              </p>
            )}
          </>
        )}

        {view === 'oversikt' && (
          <CheatSheet
            cards={allCards}
            selected={selected}
            onToggleCompare={toggleCompare}
            maxSelected={MAX_COMPARE}
          />
        )}
      </main>

      {view === 'oversikt' && (
        <ComparisonDrawer
          selected={selected}
          cards={allCards}
          onRemove={removeCompare}
          onClear={() => setSelected([])}
        />
      )}
    </div>
  )
}
