import { useState, useMemo, use } from 'react'
import { fetchCards } from '../data/loader'
import { FlipCard } from '../components/FlipCard'
import { SearchIcon, CloseIcon } from '../components/Icons'

export function AboutApps() {
  const allCards = use(fetchCards())
  const [query, setQuery] = useState('')

  const filteredCards = useMemo(() => {
    if (!query.trim()) return allCards
    const q = query.toLowerCase()
    return allCards.filter(
      c =>
        c.navn.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.alene.toLowerCase().includes(q) ||
        c.sammen.toLowerCase().includes(q)
    )
  }, [query, allCards])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        <p className="text-sm text-slate-500 text-center mb-4">
          Trykk på et kort for å se hva appen gjør — og hvordan den jobber med de andre
        </p>
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter app..."
            value={query}
            onChange={e => setQuery(e.target.value)}
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

        {/* Match count */}
        {query && (
          <p className="text-xs text-slate-500 mb-3 px-1">
            {filteredCards.length === 0
              ? 'Ingen apper matcher søket ditt.'
              : `${filteredCards.length} app${filteredCards.length !== 1 ? 'er' : ''} funnet`}
          </p>
        )}

        {/* Card grid */}
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
      </main>
    </div>
  )
}
