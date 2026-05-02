import { useState } from 'react'
import type { FlipCard as FlipCardType } from '../types'
import { FlipIcon } from './Icons'

interface FlipCardProps {
  card: FlipCardType
}

function iconSrc(navn: string): string {
  const slug = navn.toLowerCase().replace(/ /g, '-')
  return `${import.meta.env.BASE_URL}m365-icons/${slug}.png`
}

function AppBadge({ navn }: { navn: string }) {
  return (
    <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
      <img
        src={iconSrc(navn)}
        alt=""
        width={56}
        height={56}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export function FlipCard({ card }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => setFlipped(f => !f)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setFlipped(f => !f)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${card.navn}: ${flipped ? 'Bakside — trykk for forside' : 'Forside — trykk for mer informasjon'}`}
      aria-pressed={flipped}
      className={`flip-card min-h-[14rem] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-[14px] outline-none ${flipped ? 'is-flipped' : ''}`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
    >
      <div className="flip-card-inner">
        {/* Forside */}
        <div className="flip-card-face relative bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center p-4 gap-3 hover:shadow-md transition-shadow">
          <AppBadge navn={card.navn} />
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">{card.navn}</p>
            <p className="text-xs text-slate-500 leading-snug">{card.tagline}</p>
          </div>
          <div className="absolute bottom-2 right-2 text-slate-300">
            <FlipIcon size={14} />
          </div>
        </div>

        {/* Bakside */}
        <div
          className="flip-card-face flip-card-back relative flex flex-col p-4 pb-7 text-left"
          style={{ backgroundColor: '#00263e' }}
        >
          <div className="flex-1 flex flex-col justify-center gap-2.5">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-200 mb-1">Hva den gjør</p>
              <p className="text-xs text-white leading-snug">{card.alene}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-200 mb-1">Hvordan den spiller med andre</p>
              <p className="text-xs text-white leading-snug">{card.sammen}</p>
            </div>
          </div>
          {card.fotnote && (
            <p className="text-[0.6rem] text-brand-200/70 italic mt-2 pt-2 border-t border-white/10 leading-snug">
              {card.fotnote}
            </p>
          )}
          <div className="absolute bottom-2 right-2 text-brand-200/40">
            <FlipIcon size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
