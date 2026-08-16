import { useEffect, useRef, useState } from 'react'

const ROTATE_INTERVAL_MS = 2600
const MAX_LAPS = 2

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Roterer placeholder-teksten mellom det brukeren kan søke på i den
// enkelte visningen, f.eks. "Søk i ord...", "Søk i beskrivelse...".
// Stopper etter noen runder gjennom listen i stedet for å rotere i det
// uendelige (WCAG 2.2.2), og roterer aldri ved prefers-reduced-motion.
export function useRotatingPlaceholder(prefix: string, words: string[]): string {
  const [index, setIndex] = useState(0)
  const ticks = useRef(0)

  useEffect(() => {
    if (words.length <= 1 || prefersReducedMotion()) return
    const maxTicks = words.length * MAX_LAPS
    const id = setInterval(() => {
      ticks.current += 1
      setIndex(i => (i + 1) % words.length)
      if (ticks.current >= maxTicks) clearInterval(id)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [words])

  return `${prefix} ${words[index] ?? words[0]}...`
}
