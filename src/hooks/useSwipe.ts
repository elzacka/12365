import { useRef, type TouchEvent } from 'react'

const MIN_DISTANCE = 50
const EDGE = 24

// Horizontal one-finger swipe. Ignores mostly vertical moves (scrolling) and
// touches starting at the screen edges, where the OS back gesture lives.
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0]
      const nearEdge = t.clientX < EDGE || t.clientX > window.innerWidth - EDGE
      start.current = e.touches.length === 1 && !nearEdge ? { x: t.clientX, y: t.clientY } : null
    },
    onTouchEnd: (e: TouchEvent) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < 2 * Math.abs(dy)) return
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    },
    onTouchCancel: () => {
      start.current = null
    },
  }
}
