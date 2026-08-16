import { useEffect, useState } from 'react'

const ROTATE_INTERVAL_MS = 2600

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Roterer placeholder-teksten mellom det brukeren kan søke på i den
// enkelte visningen, f.eks. "Søk i ord...", "Søk i beskrivelse...".
// Fryser ved fokus (naturlig pause-mekanisme, WCAG 2.2.2) og roterer
// aldri ved prefers-reduced-motion.
export function useRotatingPlaceholder(prefix: string, words: string[], paused: boolean): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (paused || words.length <= 1 || prefersReducedMotion()) return
    const id = setInterval(() => setIndex(i => (i + 1) % words.length), ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, words])

  return `${prefix} ${words[index] ?? words[0]}...`
}
