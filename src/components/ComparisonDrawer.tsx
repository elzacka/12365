import { useEffect, useRef, useState } from 'react'
import type { FlipCard } from '../types'
import { iconSrc } from '../data/icons'
import { CloseIcon } from './Icons'

interface ComparisonDrawerProps {
  selected: string[]
  cards: FlipCard[]
  onRemove: (navn: string) => void
  onClear: () => void
}

export function ComparisonDrawer({
  selected,
  cards,
  onRemove,
  onClear,
}: ComparisonDrawerProps) {
  const [expanded, setExpanded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const items = selected
    .map(navn => cards.find(c => c.navn === navn))
    .filter((c): c is FlipCard => Boolean(c))

  useEffect(() => {
    if (!expanded) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setExpanded(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  if (items.length === 0) return null

  return (
    <>
      {/* Spacer so the fixed drawer doesn't cover the last row. */}
      <div aria-hidden="true" className="h-20" />

      <div
        role="region"
        aria-label="Sammenligning av apper"
        className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3"
      >
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex -space-x-2">
              {items.map(card => (
                <div
                  key={card.navn}
                  className="w-9 h-9 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm"
                >
                  <img
                    src={iconSrc(card.navn)}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800">
                {expanded ? 'Skjul sammenligning' : `Sammenlign ${items.length} apper`}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {items.map(c => c.navn).join(', ')}
              </div>
            </div>
            <span aria-hidden="true" className="text-slate-400 text-xs">
              {expanded ? 'Lukk' : 'Åpne'}
            </span>
          </button>

          {expanded && (
            <div className="border-t border-slate-200 p-3 max-h-[70svh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500">
                  {items.length} valgt
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-brand-700 rounded-lg"
                >
                  <CloseIcon size={14} />
                  Fjern alle
                </button>
              </div>

              <div
                className={`grid gap-3 ${
                  items.length === 1
                    ? 'grid-cols-1'
                    : items.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                }`}
              >
                {items.map(card => (
                  <article
                    key={card.navn}
                    className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2"
                  >
                    <header className="flex items-center gap-2">
                      <img
                        src={iconSrc(card.navn)}
                        alt=""
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                        {card.navn}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemove(card.navn)}
                        aria-label={`Fjern ${card.navn}`}
                        className="ml-auto text-slate-400 hover:text-slate-700"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </header>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Hva den gjør
                      </p>
                      <p className="text-xs text-slate-700 leading-snug">{card.alene}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Sammen med andre
                      </p>
                      <p className="text-xs text-slate-700 leading-snug">{card.sammen}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
