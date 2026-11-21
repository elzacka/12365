import { useState, type ReactNode } from 'react'
import type { FlipCard as FlipCardType } from '../types'
import { iconSrc } from '../data/icons'
import { FlipIcon, ExternalLinkIcon } from './Icons'

interface FlipCardProps {
  card: FlipCardType
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

interface FlipFrameProps {
  label: string
  front: ReactNode
  back: ReactNode
  frontClassName: string
  backClassName: string
  className?: string
}

// The whole card flips on a click; keyboard and screen reader users get one
// flip button. The hidden face is inert, so its link is never focused unseen.
export function FlipFrame({ label, front, back, frontClassName, backClassName, className = '' }: FlipFrameProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className={`flip-card relative ${className} ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped(f => !f)}
    >
      {/* First in reading order: the back face follows it once flipped. */}
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={label}
        onClick={e => {
          e.stopPropagation()
          setFlipped(f => !f)
        }}
        className={`absolute bottom-1 right-1 z-10 w-8 h-8 flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-brand-500 ${
          flipped ? 'text-brand-200 focus-visible:outline-white' : 'text-slate-500'
        }`}
      >
        <FlipIcon size={14} />
      </button>
      <div className="flip-card-inner">
        <div inert={flipped} className={`flip-card-face relative ${frontClassName}`}>{front}</div>
        <div inert={!flipped} className={`flip-card-face flip-card-back relative ${backClassName}`}>{back}</div>
      </div>
    </div>
  )
}

export function FlipCard({ card }: FlipCardProps) {
  return (
    <FlipFrame
      label={`Snu kortet for ${card.navn}`}
      className="min-h-[14rem]"
      /* The name is the vertical anchor in the middle of the card; icon and
         tagline get equal spacing. 1fr rows keep it centered whatever the tagline length. */
      frontClassName="bg-white border border-slate-200 shadow-sm grid grid-rows-[1fr_auto_1fr] justify-items-center text-center p-4 hover:shadow-md transition-shadow"
      backClassName="bg-brand-700 flex flex-col p-4 pb-9 text-left"
      front={
        <>
          <div className="self-end mb-3">
            <AppBadge name={card.navn} />
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{card.navn}</p>
          <p className="self-start mt-3 text-xs text-slate-500 leading-snug">{card.tagline}</p>
        </>
      }
      back={
        <div className="flex-1 flex flex-col gap-2.5">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-200 mb-1">Hva den gjør</p>
            <p className="text-xs text-white leading-snug">{card.alene}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-200 mb-1">Sammen med andre</p>
            <p className="text-xs text-white leading-snug">{card.sammen}</p>
            {card.lenke && (
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
            )}
          </div>
          {card.fotnote && (
            <p className="text-[0.6rem] text-brand-200/80 italic pt-2 border-t border-white/10 leading-snug">
              {card.fotnote}
            </p>
          )}
        </div>
      }
    />
  )
}
