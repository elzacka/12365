import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { Oppslag } from '../types'

const ENTRIES: Oppslag[] = [
  { id: 'filter', tittel: 'Legg til eller fjern filter', forklaring: '**Ctrl+Skift+L**', tags: ['excel'] },
  { id: 'punkt', tittel: 'Legg til en punktliste', forklaring: '**Ctrl+Skift+L**', tags: ['word'] },
  { id: 'laas', tittel: 'Lås datamaskinen', forklaring: '**Windows-tast+L**\nGjelder alle apper', tags: ['windows'] },
]

// One stable promise: `use()` suspends again on every new one.
const loaded = Promise.resolve(ENTRIES)
vi.mock('../data/loader', () => ({ fetchHurtigtaster: () => loaded }))

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

async function renderPage() {
  const { Hurtigtaster } = await import('./Hurtigtaster')
  await act(async () => {
    render(<Suspense fallback={null}><Hurtigtaster /></Suspense>)
  })
}

const headings = () => screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)

describe('Hurtigtaster', () => {
  it('groups by app in GROUPS order and shows the keys without expanding', async () => {
    await renderPage()
    expect(headings()).toEqual(['Windows', 'Word', 'Excel'])
    const keys = [...document.querySelectorAll('kbd')].map(k => k.textContent)
    expect(keys.filter(k => k === 'Ctrl+⇧Skift+L')).toHaveLength(2)
    expect(screen.queryByText('Gjelder alle apper')).toBeNull()
  })

  it('keeps the app heading on search hits', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'skift' } })
    expect(headings()).toEqual(['Word', 'Excel'])
  })
})
