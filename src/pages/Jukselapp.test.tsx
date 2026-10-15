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
vi.mock('../data/loader', () => ({ fetchJukselapp: () => loaded }))

beforeAll(() => {
  window.scrollTo = () => {}
  Element.prototype.scrollIntoView = () => {}
  window.matchMedia ??= ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

async function renderPage() {
  const { Jukselapp } = await import('./Jukselapp')
  await act(async () => {
    render(<Suspense fallback={null}><Jukselapp /></Suspense>)
  })
}

// Visible text is the number only; " treff" is for screen readers.
const count = () => document.querySelector('[aria-live="polite"]')?.textContent

const expand = (title: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }))
const clickTag = (tag: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`(merket|filter) ${tag}$`) }))

describe('Jukselapp', () => {
  it('shows no count unfiltered, then the entries with every selected tag', async () => {
    await renderPage()
    expect(count()).toBe('')

    expand('Alfa')
    clickTag('ki')
    expect(count()).toBe('2 treff')

    // The entry stays open, so a second tag can be picked from it.
    clickTag('metode')
    expect(count()).toBe('1 treff')
    expect(screen.queryByText('Beta')).toBeNull()
    expect(screen.getByRole('button', { name: /Alfa/ })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getAllByRole('button', { name: 'Fjern filter ki' })[0])
    expect(count()).toBe('2 treff')
  })

  it('counts search results', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'G' } })
    expect(count()).toBe('1 treff')
  })
})
