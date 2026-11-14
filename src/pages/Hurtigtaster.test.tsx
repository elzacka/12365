import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { Oppslag } from '../types'

const ENTRIES: Oppslag[] = [
  { id: 'filter', tittel: 'Legg til eller fjern filter', forklaring: 'CTRL+SKIFT+L', tags: ['excel'] },
  { id: 'punkt', tittel: 'Legg til en punktliste', forklaring: 'Ctrl+Skift+L', tags: ['word'] },
  { id: 'laas', tittel: 'Lås datamaskinen', forklaring: 'Windows-tast+L', tags: ['windows'] },
  { id: 'cedilla', tittel: 'ç', forklaring: 'ALT+0231', tags: ['internasjonale tegn', 'nye outlook'] },
  { id: 'oppgave', tittel: 'Opprett en oppgave', forklaring: 'Ctrl+Skift+K', tags: ['microsoft 365'] },
]

// One stable promise: `use()` suspends again on every new one.
const loaded = Promise.resolve(ENTRIES)
vi.mock('../data/loader', () => ({ fetchHurtigtaster: () => loaded }))

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
  const { Hurtigtaster } = await import('./Hurtigtaster')
  await act(async () => {
    render(<Suspense fallback={null}><Hurtigtaster /></Suspense>)
  })
}

const headings = () => screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)

describe('Hurtigtaster', () => {
  it('groups by app in GROUPS order, general sections last, and shows the keys without the tag', async () => {
    await renderPage()
    expect(headings()).toEqual(['Word', 'Excel', 'Microsoft 365', 'Windows', 'Internasjonale tegn'])
    const row = document.getElementById('ord-filter')!
    expect([...row.querySelectorAll('kbd')].map(k => k.textContent)).toEqual(['Ctrl', '⇧Skift', 'L'])
    expect(row.querySelector('[aria-pressed]')).toBeNull()
  })

  it('finds one app by searching its name', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'excel' } })
    expect(headings()).toEqual(['Excel'])
    fireEvent.click(screen.getByRole('button', { name: /Vis alle oppslag merket/ }))
    expect(headings()).toEqual(['Excel'])
  })

  it('keeps the app heading on search hits', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'skift' } })
    expect(headings()).toEqual(['Word', 'Excel', 'Microsoft 365'])
  })

  it('finds an international character under its app name too', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nye outlook' } })
    expect(headings()).toEqual(['Internasjonale tegn'])
  })
})
