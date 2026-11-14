import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ScrollToTop } from './ScrollToTop'

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('ScrollToTop', () => {
  it('shows after one screen and scrolls to the top', () => {
    window.matchMedia ??= (() => ({ matches: false })) as unknown as typeof window.matchMedia
    const spy = vi.fn()
    window.scrollTo = spy as typeof window.scrollTo
    render(<ScrollToTop />)
    const button = screen.getByLabelText('Til toppen')
    expect(button.hasAttribute('inert')).toBe(true)

    scrollTo(window.innerHeight + 1)
    expect(button.hasAttribute('inert')).toBe(false)
    fireEvent.click(button)
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))

    scrollTo(0)
    expect(button.hasAttribute('inert')).toBe(true)
  })
})
