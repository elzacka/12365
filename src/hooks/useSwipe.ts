import { useEffect, useEffectEvent } from 'react'

const MIN_DISTANCE = 50
const EDGE = 24
const SLOP = 8

// One-finger swipe. The first clear movement locks the axis: sideways blocks
// page scroll, vertical scrolls and never swipes. Screen edges (OS back
// gesture) and data-noswipe elements are left alone.
export function useSwipe(
  el: HTMLElement | null,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
) {
  const swiped = useEffectEvent((dx: number) => {
    if (dx < 0) onSwipeLeft()
    else onSwipeRight()
  })

  useEffect(() => {
    if (!el) return
    let start: { x: number; y: number } | null = null
    let axis: 'x' | 'y' | null = null

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      const nearEdge = t.clientX < EDGE || t.clientX > window.innerWidth - EDGE
      const ignored = e.target instanceof Element && e.target.closest('[data-noswipe]')
      start = e.touches.length === 1 && !nearEdge && !ignored ? { x: t.clientX, y: t.clientY } : null
      axis = null
    }
    const onMove = (e: TouchEvent) => {
      if (!start) return
      const t = e.touches[0]
      const dx = Math.abs(t.clientX - start.x)
      const dy = Math.abs(t.clientY - start.y)
      if (!axis) {
        if (Math.max(dx, dy) < SLOP) return
        axis = dx > dy ? 'x' : 'y'
      }
      if (axis === 'x' && e.cancelable) e.preventDefault()
    }
    const onEnd = (e: TouchEvent) => {
      if (start && axis === 'x') {
        const dx = e.changedTouches[0].clientX - start.x
        if (Math.abs(dx) >= MIN_DISTANCE) swiped(dx)
      }
      start = null
    }
    const onCancel = () => {
      start = null
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onCancel)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onCancel)
    }
  }, [el])
}
