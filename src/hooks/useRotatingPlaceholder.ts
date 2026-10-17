import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const ROTATE_INTERVAL_MS = 2600
const MAX_LAPS = 2

// Cycles the placeholder through what the view can search ("Søk i ord...").
// Stops after a few laps (WCAG 2.2.2) and never runs under reduced motion.
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
