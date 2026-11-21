import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { KiVurdering as KiVurderingData } from '../types'

const DATA: KiVurderingData = {
  bokser: [
    { id: 'innledning', tittel: 'Innledning', tekst: 'Første avsnitt\n\n- Et punkt' },
    { id: 'gjelder-alltid', tittel: 'Gjelder alltid', tekst: 'Alltid' },
  ],
  veiledning: 'Gå i rekkefølge',
  kort: ['A', 'B', 'C', 'D'].map(t => ({
    id: t.toLowerCase(), tittel: t, farge: 'rod' as const, sporsmal: `${t}?`, eksempler: [`${t} eksempel`],
    svar: `${t} svar`, punkter: [`${t} punkt`], kilde: `${t} kilde`,
  })),
  merknad: 'Ikke juridisk vurdering',
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
  it('opens each box on its own', async () => {
    await renderPage()
    const toggle = screen.getByRole('button', { name: 'Innledning' })
    expect(screen.getByRole('button', { name: 'Gjelder alltid' })).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Første avsnitt')).toBeNull()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Første avsnitt')).toBeInTheDocument()
    expect(screen.getByText('Et punkt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gjelder alltid' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('flips one card at a time with its own button', async () => {
    await renderPage()
    const flips = screen.getAllByRole('button', { name: /^Snu kort \d, / })
    expect(flips).toHaveLength(4)

    fireEvent.click(flips[1])
    expect(flips[1]).toHaveAttribute('aria-pressed', 'true')
    expect(flips[0]).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('B svar').closest('[inert]')).toBeNull()
    expect(screen.getByText('A svar').closest('[inert]')).not.toBeNull()
  })
})
