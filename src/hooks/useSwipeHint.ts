import { useEffect } from 'react'

const KEY = 'swipe-hint-shown'
const DELAY = 700

function wasShown(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

// Nudges the step card sideways once per device, so touch readers discover
// swipe. A touch before the nudge leaves it for a later article.
export function useSwipeHint(card: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!card || !enabled || wasShown()) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        return
      }
      card.animate(
        [
          { transform: 'none', easing: 'ease-out' },
          { transform: 'translateX(-24px)', offset: 0.3, easing: 'cubic-bezier(.34,1.56,.64,1)' },
          { transform: 'none' },
        ],
        { duration: 1000 },
      )
    }, DELAY)
    const cancel = () => clearTimeout(timer)
    document.addEventListener('touchstart', cancel, { once: true, passive: true })
    return () => {
      clearTimeout(timer)
      document.removeEventListener('touchstart', cancel)
    }
  }, [card, enabled])
}
