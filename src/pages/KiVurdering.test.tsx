import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { KiVurdering as KiVurderingData } from '../types'

const DATA: KiVurderingData = {
  bokser: [
    { id: 'innledning', tittel: 'Innledning', tekst: 'Første avsnitt\n\n- Et punkt' },
    { id: 'gjelder-alltid', tittel: 'Gjelder alltid', tekst: 'Alltid' },
  ],
  kort: ['A', 'B', 'C', 'D'].map(t => ({
    id: t.toLowerCase(), tittel: t, farge: 'rod' as const, sporsmal: `${t}?`, oppsummering: `${t} kort`, eksempler: [`${t} eksempel`],
    svar: `${t} svar`, regler: [`${t} regel`], tiltak: t === 'A' ? [] : [`${t} tiltak`], kilde: `${t} [art. 5](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5)`,
    ...(t === 'B' && { etikett: 'Hele lista', lenke: '[Vedlegg III](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3)' }),
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

  it('titles the front box with the card label, else «Eksempler»', async () => {
    await renderPage()
    expect(screen.getByRole('button', { name: 'Hele lista' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Eksempler' })).toHaveLength(3)
  })

  it('opens a card box without flipping the card', async () => {
    await renderPage()
    const flip = screen.getAllByRole('button', { name: /^Snu kort \d, / })[0]
    const box = screen.getAllByRole('button', { name: 'Eksempler' })[0]
    expect(screen.queryByText('A eksempel')).toBeNull()

    fireEvent.click(box)
    expect(box).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('A eksempel')).toBeInTheDocument()
    expect(flip).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByText('A?'))
    expect(flip).toHaveAttribute('aria-pressed', 'false')
  })

  it('links the legal basis to the article', async () => {
    await renderPage()
    const links = screen.getAllByRole('link', { name: 'art. 5' })
    expect(links).toHaveLength(4)
    expect(links[0]).toHaveAttribute('href', 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5')
  })

  it('shows the list link at the end of the opened box', async () => {
    await renderPage()
    expect(screen.queryByRole('link', { name: 'Vedlegg III' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Hele lista' }))
    expect(screen.getByRole('link', { name: 'Vedlegg III' })).toHaveAttribute('href', 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3')
  })

  it('shows the back boxes with one open at a time, and hides an empty one', async () => {
    await renderPage()
    expect(screen.getAllByRole('button', { name: 'Regler og unntak' })).toHaveLength(4)
    expect(screen.getAllByRole('button', { name: 'Tiltak' })).toHaveLength(3)
    const [regler, tiltak] = [screen.getAllByRole('button', { name: 'Regler og unntak' })[1], screen.getAllByRole('button', { name: 'Tiltak' })[0]]
    fireEvent.click(regler)
    expect(screen.getByText('B regel')).toBeInTheDocument()
    fireEvent.click(tiltak)
    expect(screen.queryByText('B regel')).toBeNull()
    expect(screen.getByText('B tiltak')).toBeInTheDocument()
    expect(regler).toHaveAttribute('aria-expanded', 'false')
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
