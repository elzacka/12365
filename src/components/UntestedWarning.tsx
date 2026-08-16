import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { WarningIcon } from './Icons'

const MESSAGE = 'Fremgangsmåte ikke testet eller språkvasket ennå'
const TOOLTIP_WIDTH = 192
const VIEWPORT_MARGIN = 8

// Tap-triggered warning badge for locked articles whose steps haven't been
// verified yet. Sits inside a Link on the article cards, so clicks must be
// stopped from bubbling into navigation. The tooltip renders through a
// portal, positioned from the button's own rect, so it isn't clipped by the
// card list's `overflow-hidden`.
export function UntestedWarning({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const tooltipId = useId()

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const left = Math.min(
      Math.max(centerX, TOOLTIP_WIDTH / 2 + VIEWPORT_MARGIN),
      window.innerWidth - TOOLTIP_WIDTH / 2 - VIEWPORT_MARGIN
    )
    setPos({ top: rect.bottom + 4, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeIfOutside = (e: MouseEvent | TouchEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeIfOutside)
    document.addEventListener('touchstart', closeIfOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeIfOutside)
      document.removeEventListener('touchstart', closeIfOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(v => !v)
        }}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`Advarsel: ${MESSAGE}`}
        className={`shrink-0 p-1 -m-1 text-amber-500 ${className ?? ''}`}
      >
        <WarningIcon size={13} />
      </button>
      {open && pos && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          style={{ top: pos.top, left: pos.left, width: TOOLTIP_WIDTH }}
          className="fixed z-50 -translate-x-1/2 rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg"
        >
          {MESSAGE}
        </span>,
        document.body
      )}
    </>
  )
}
