import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Keys } from './Keys'

describe('Keys', () => {
  it('shows a pause sign, not a comma, between keys pressed one after the other', () => {
    const { container } = render(<Keys text="Alt+F, X" />)
    expect(container.querySelectorAll('kbd')).toHaveLength(3)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.textContent).toBe('Alt+F, så X')
  })

  it('keeps a comma that is part of the words', () => {
    const { container } = render(<Keys text="F6 to ganger, så Ctrl+Skift+H" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toContain('to ganger, så')
  })
})
