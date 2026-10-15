import { useState, use } from 'react'
import { fetchCards } from '../data/loader'
import { useMergedCards } from '../auth/merge'
import { FlipCard } from '../components/FlipCard'
import { Sammenligne } from '../components/Sammenligne'
import { ComparisonDrawer } from '../components/ComparisonDrawer'
import { ViewToggle, type AppsView } from '../components/ViewToggle'

const MAX_COMPARE = 3

export function Appene() {
  const publicCards = use(fetchCards())
  const allCards = useMergedCards(publicCards)
  const [view, setView] = useState<AppsView>('oversikt')
  const [selected, setSelected] = useState<string[]>([])

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

        {view === 'sammenligne' && (
          <p className="text-[10px] text-slate-500 text-center mb-4">
            Trykk + for å sammenligne eller ↔ for å gå til en relatert app
          </p>
        )}

        {view === 'oversikt' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allCards.map(card => (
                <FlipCard key={card.navn} card={card} />
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
              {allCards.length} apper totalt
            </p>
          </>
        )}

        {view === 'sammenligne' && (
          <Sammenligne
            cards={allCards}
            selected={selected}
            onToggleCompare={toggleCompare}
            maxSelected={MAX_COMPARE}
          />
        )}
      </main>

      {view === 'sammenligne' && (
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
