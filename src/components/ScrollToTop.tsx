import { useEffect, useState } from 'react'
import { ChevronRightIcon } from './Icons'

// Floating «Til toppen», shown once the reader has scrolled past the first screen.
export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
    // The button goes inert at the top: hand keyboard focus to the header instead of the page body.
    document.querySelector<HTMLElement>('header a, header button')?.focus({ preventScroll: true })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      inert={!visible}
      aria-label="Til toppen"
      title="Til toppen"
      className={`fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 shadow-sm hover:text-slate-700 hover:bg-white transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <ChevronRightIcon size={18} className="-rotate-90" />
    </button>
  )
}
