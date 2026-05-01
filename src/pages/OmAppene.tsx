import { useState, useMemo } from 'react'
import { M365_CARDS } from '../data/cards'
import { FlipCard } from '../components/FlipCard'
import { SearchIcon, CloseIcon } from '../components/Icons'

export function OmAppene() {
  const [filter, setFilter] = useState('')

  const kortene = useMemo(() => {
    if (!filter.trim()) return M365_CARDS
    const q = filter.toLowerCase()
    return M365_CARDS.filter(
      c =>
        c.navn.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.alene.toLowerCase().includes(q) ||
        c.sammen.toLowerCase().includes(q)
    )
  }, [filter])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Intro */}
      <div className="bg-blue-700 text-white px-4 pt-6 pb-8">
        <p className="text-blue-100 text-sm leading-relaxed">
          Trykk på et kort for å se hva appen gjør — og hvordan den jobber med de andre.
        </p>
      </div>

      <div className="bg-blue-700 h-5 relative">
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-slate-50 rounded-t-[1.5rem]" />
      </div>

      <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Søk */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter app..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            aria-label="Søk i apper"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Tøm søk"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Antall treff */}
        {filter && (
          <p className="text-xs text-slate-500 mb-3 px-1">
            {kortene.length === 0
              ? 'Ingen apper matcher søket ditt.'
              : `${kortene.length} app${kortene.length !== 1 ? 'er' : ''} funnet`}
          </p>
        )}

        {/* Kortgrid */}
        {kortene.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {kortene.map(card => (
              <FlipCard key={card.navn} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base mb-1">Ingen apper funnet</p>
            <button
              onClick={() => setFilter('')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Vis alle apper
            </button>
          </div>
        )}

        {!filter && (
          <p className="text-xs text-slate-400 text-center mt-6">
            {M365_CARDS.length} apper totalt
          </p>
        )}
      </main>
    </div>
  )
}
