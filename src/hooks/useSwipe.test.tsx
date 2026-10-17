import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSwipe } from './useSwipe'

function touch(el: Element, type: string, x: number, y: number) {
  const e = new Event(type, { bubbles: true, cancelable: true })
  const list = [{ clientX: x, clientY: y }]
  Object.defineProperty(e, 'touches', { value: type === 'touchend' ? [] : list })
  Object.defineProperty(e, 'changedTouches', { value: list })
  el.dispatchEvent(e)
}

function gesture(el: Element, points: [number, number][]) {
  const [first, ...rest] = points
  touch(el, 'touchstart', ...first)
  for (const p of rest) touch(el, 'touchmove', ...p)
  touch(el, 'touchend', ...points[points.length - 1])
}

describe('useSwipe', () => {
  let el: HTMLElement
  const onDrag = vi.fn()
  const onRelease = vi.fn()

  beforeEach(() => {
    el = document.createElement('div')
    document.body.append(el)
    onDrag.mockClear()
    onRelease.mockClear()
    renderHook(() => useSwipe(el, { onDrag, onRelease }))
  })

  it('reports the drag and a left swipe', () => {
    gesture(el, [[200, 300], [180, 302], [120, 305]])
    expect(onDrag).toHaveBeenLastCalledWith(-80)
    expect(onRelease).toHaveBeenCalledWith(-1)
  })

  it('releases a short drag as 0', () => {
    gesture(el, [[200, 300], [220, 300], [230, 300]])
    expect(onRelease).toHaveBeenCalledWith(0)
  })

  it('leaves vertical scroll alone', () => {
    gesture(el, [[200, 300], [202, 250], [260, 150]])
    expect(onDrag).not.toHaveBeenCalled()
    expect(onRelease).not.toHaveBeenCalled()
  })

  it('ignores touches at the screen edge', () => {
    gesture(el, [[5, 300], [60, 300], [120, 300]])
    expect(onRelease).not.toHaveBeenCalled()
  })
})
