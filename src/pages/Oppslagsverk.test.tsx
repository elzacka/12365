import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { Oppslag } from '../types'

const ORD: Oppslag[] = [
  { id: 'a', tittel: 'Alfa', forklaring: 'Første.', tags: ['ki', 'metode'] },
  { id: 'b', tittel: 'Beta', forklaring: 'Andre.', tags: ['ki'] },
  { id: 'c', tittel: 'Gamma', forklaring: 'Tredje.', tags: ['metode'] },
]

// One stable promise: `use()` suspends again on every new one.
const loaded = Promise.resolve(ORD)
vi.mock('../data/loader', () => ({ fetchOppslagsverk: () => loaded }))

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

async function renderPage() {
  const { Oppslagsverk } = await import('./Oppslagsverk')
  await act(async () => {
    render(<Suspense fallback={null}><Oppslagsverk /></Suspense>)
  })
}

// Visible text is the number only; " treff" is for screen readers.
const count = () => document.querySelector('[aria-live="polite"]')?.textContent

function clickTag(title: string, tag: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }))
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`(merket|filter) ${tag}$`) }))
}

describe('Oppslagsverk', () => {
  it('shows no count unfiltered, then the entries with every selected tag', async () => {
    await renderPage()
    expect(count()).toBe('')

    clickTag('Alfa', 'ki')
    expect(count()).toBe('2 treff')

    clickTag('Alfa', 'metode')
    expect(count()).toBe('1 treff')
    expect(screen.queryByText('Beta')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Fjern filter ki' }))
    expect(count()).toBe('2 treff')
  })

  it('counts search results', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'G' } })
    expect(count()).toBe('1 treff')
  })
})
