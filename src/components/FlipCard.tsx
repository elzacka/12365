import { useState } from 'react'
import type { FlipCard as FlipCardType } from '../types'
import { FlipIcon, ExternalLinkIcon } from './Icons'

interface FlipCardProps {
  card: FlipCardType
}

const SVG_ICONS = new Set(['places', 'copilot-studio-for-teams', 'copilot'])

function iconSrc(name: string): string {
  const slug = name.toLowerCase().replace(/ /g, '-')
  const ext = SVG_ICONS.has(slug) ? 'svg' : 'png'
  return `${import.meta.env.BASE_URL}m365-icons/${slug}.${ext}`
}

function AppBadge({ name }: { name: string }) {
  return (
    <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
      <img
        src={iconSrc(name)}
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
        {/* Front — the name is the vertical anchor in the middle of the card;
            icon and tagline get equal spacing (mb-3 / mt-3). 1fr rows around
            the name keep it centered vertically regardless of tagline length. */}
        <div className="flip-card-face relative bg-white border border-slate-200 shadow-sm grid grid-rows-[1fr_auto_1fr] justify-items-center text-center p-4 hover:shadow-md transition-shadow">
          <div className="self-end mb-3">
            <AppBadge name={card.navn} />
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{card.navn}</p>
          <p className="self-start mt-3 text-xs text-slate-500 leading-snug">{card.tagline}</p>
          <div className="absolute bottom-2 right-2 text-slate-300">
            <FlipIcon size={14} />
          </div>
        </div>

        {/* Back */}
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
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-200 mb-1">Sammen med andre</p>
              <p className="text-xs text-white leading-snug">{card.sammen}</p>
              {card.lenke ? (
                <p className="mt-3 text-xs leading-snug">
                  <a
                    href={card.lenke.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-brand-200 hover:text-white transition-colors"
                  >
                    {card.lenke.tekst}
                    <ExternalLinkIcon size={11} className="inline-block ml-0.5 align-[-0.125em]" />
                  </a>
                </p>
              ) : (
                <p aria-hidden="true" className="invisible mt-3 text-xs leading-snug">
                  Lenketekst-plassholder
                </p>
              )}
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
