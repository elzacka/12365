import type { FlipCard } from '../types'
import { APP_CATEGORIES } from '../data/appCategories'
import { slugify } from '../data/slug'
import { SammenligneRow } from './SammenligneRow'

interface SammenligneProps {
  cards: FlipCard[]
  selected: string[]
  onToggleCompare: (navn: string) => void
  maxSelected: number
}

function jumpTo(navn: string) {
  const el = document.getElementById(`app-${slugify(navn)}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('sammenligne-pulse')
  window.setTimeout(() => el.classList.remove('sammenligne-pulse'), 1200)
}

// Cards grouped by kategori, in the editorial order of the categories.
export function Sammenligne({
  cards,
  selected,
  onToggleCompare,
  maxSelected,
}: SammenligneProps) {
  const canSelectMore = selected.length < maxSelected
  const sections = APP_CATEGORIES
    .map(kategori => ({ kategori, cards: cards.filter(c => c.kategori === kategori.id) }))
    .filter(s => s.cards.length > 0)

  return (
    <div className="space-y-4">
      {sections.map(({ kategori, cards: sectionCards }) => (
        <section
          key={kategori.id}
          aria-labelledby={`kategori-${kategori.id}`}
          className={`rounded-2xl border border-slate-200 ${kategori.fargeBakgrunn} p-3 sm:p-4`}
        >
          <header className="px-1 pb-2 mb-2 border-b border-slate-200/60">
            <h3
              id={`kategori-${kategori.id}`}
              className="text-sm font-semibold text-slate-800"
            >
              {kategori.navn}
            </h3>
            {kategori.beskrivelse && (
              <p className="text-xs text-slate-600 mt-0.5">{kategori.beskrivelse}</p>
            )}
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sectionCards.map(card => (
              <SammenligneRow
                key={card.navn}
                card={card}
                selected={selected.includes(card.navn)}
                onToggleCompare={onToggleCompare}
                onJumpTo={jumpTo}
                canSelectMore={canSelectMore}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
