import type { FlipCard } from '../types'
import { iconSrc } from '../data/icons'
import { slugify } from '../data/slug'
import { CheckIcon, PlusIcon } from './Icons'

interface CheatSheetRowProps {
  card: FlipCard
  selected: boolean
  onToggleCompare: (navn: string) => void
  onJumpTo: (navn: string) => void
  canSelectMore: boolean
}

export function CheatSheetRow({
  card,
  selected,
  onToggleCompare,
  onJumpTo,
  canSelectMore,
}: CheatSheetRowProps) {
  const overlapper = card.overlapper ?? []
  const oppsummering = card.oppsummering || card.tagline

  return (
    <li
      id={`app-${slugify(card.navn)}`}
      data-cheat-row={card.navn}
      className="group relative flex items-start gap-3 p-3 rounded-xl bg-white/70 hover:bg-white transition-colors"
    >
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
        <img
          src={iconSrc(card.navn)}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex-1 min-w-0 pr-9">
        <div className="text-sm font-semibold text-slate-800 leading-tight">
          {card.navn}
        </div>
        <div className="text-xs text-slate-600 mt-0.5 leading-snug">
          {oppsummering}
        </div>
        {overlapper.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {overlapper.map(other => (
              <button
                key={other}
                type="button"
                onClick={() => onJumpTo(other)}
                aria-label={`Overlapper med ${other}. Vis ${other} i listen.`}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                <span aria-hidden="true" className="text-slate-400">↔</span>
                {other}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onToggleCompare(card.navn)}
        disabled={!selected && !canSelectMore}
        aria-pressed={selected}
        aria-label={
          selected
            ? `Fjern ${card.navn} fra sammenligning`
            : `Legg ${card.navn} til sammenligning`
        }
        className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full border transition-all ${
          selected
            ? 'bg-brand-700 border-brand-700 text-white'
            : 'bg-white border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500'
        }`}
      >
        {selected ? <CheckIcon size={14} /> : <PlusIcon size={14} />}
      </button>
    </li>
  )
}
