import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { KiVurdering as KiVurderingData } from '../types'

const DATA: KiVurderingData = {
  innledning: { tittel: 'Om KI-vurdering', avsnitt: ['Første avsnitt'] },
  kort: ['A', 'B', 'C', 'D'].map(t => ({ id: t.toLowerCase(), tittel: t, tagline: `${t} tagline`, tekst: `${t} tekst` })),
}

// One stable promise: `use()` suspends again on every new one.
const loaded = Promise.resolve(DATA)
vi.mock('../data/loader', () => ({ fetchKiVurdering: () => loaded }))

beforeAll(() => {
  window.scrollTo = () => {}
})

async function renderPage() {
  const { KiVurdering } = await import('./KiVurdering')
  await act(async () => {
    render(<Suspense fallback={null}><KiVurdering /></Suspense>)
  })
}

describe('KiVurdering', () => {
  it('opens the intro on demand', async () => {
    await renderPage()
    const toggle = screen.getByRole('button', { name: 'Om KI-vurdering' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Første avsnitt')).toBeNull()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Første avsnitt')).toBeInTheDocument()
  })

  it('flips one card at a time with its own button', async () => {
    await renderPage()
    const flips = screen.getAllByRole('button', { name: /^Snu kortet for / })
    expect(flips).toHaveLength(4)

    fireEvent.click(flips[1])
    expect(flips[1]).toHaveAttribute('aria-pressed', 'true')
    expect(flips[0]).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('B tekst').closest('[inert]')).toBeNull()
    expect(screen.getByText('A tekst').closest('[inert]')).not.toBeNull()
  })
})
