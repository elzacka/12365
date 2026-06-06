import { useCallback } from 'react'
import type { FlipCard } from '../types'
import { CHEAT_SHEET_CATEGORIES, CATEGORY_BY_ID } from '../data/cheatSheetCategories'
import { CheatSheetRow, slugify } from './CheatSheetRow'

interface CheatSheetProps {
  cards: FlipCard[]
  selected: string[]
  onToggleCompare: (navn: string) => void
  maxSelected: number
}

const UNCATEGORIZED_ID = '__annet__'

export function CheatSheet({
  cards,
  selected,
  onToggleCompare,
  maxSelected,
}: CheatSheetProps) {
  // Group cards by kategori, preserving the editorial order of categories.
  // Cards without a kategori fall into a synthetic "Annet" bucket at the end —
  // visible during the migration window while content is being filled in.
  const grouped = new Map<string, FlipCard[]>()
  for (const card of cards) {
    const id = card.kategori && CATEGORY_BY_ID.has(card.kategori)
      ? card.kategori
      : UNCATEGORIZED_ID
    const bucket = grouped.get(id) ?? []
    bucket.push(card)
    grouped.set(id, bucket)
  }

  const canSelectMore = selected.length < maxSelected

  const jumpTo = useCallback((navn: string) => {
    const el = document.getElementById(`app-${slugify(navn)}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('cheatsheet-pulse')
    window.setTimeout(() => el.classList.remove('cheatsheet-pulse'), 1200)
  }, [])

  const sections = [
    ...CHEAT_SHEET_CATEGORIES.map(c => ({
      kategori: c,
      cards: grouped.get(c.id) ?? [],
    })),
    ...(grouped.get(UNCATEGORIZED_ID)?.length
      ? [{
          kategori: {
            id: UNCATEGORIZED_ID,
            navn: 'Annet',
            beskrivelse: 'Apper uten kategori',
            fargeBakgrunn: 'bg-slate-50',
            fargeAksent: 'ring-slate-300',
          },
          cards: grouped.get(UNCATEGORIZED_ID) ?? [],
        }]
      : []),
  ].filter(s => s.cards.length > 0)

  if (sections.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-base mb-1">Ingen apper funnet</p>
      </div>
    )
  }

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
            <p className="text-xs text-slate-600 mt-0.5">{kategori.beskrivelse}</p>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sectionCards.map(card => (
              <CheatSheetRow
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
