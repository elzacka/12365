import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { LockedContent, Oppslag } from '../types'
import { AuthContext } from '../auth/context'

const ENTRIES: Oppslag[] = [
  { id: 'filter', tittel: 'Legg til eller fjern filter', forklaring: 'CTRL+SKIFT+L', tags: ['excel'] },
  { id: 'punkt', tittel: 'Legg til en punktliste', forklaring: 'Ctrl+Skift+L', tags: ['word'] },
  { id: 'fet', tittel: 'Bruk fet skrift', forklaring: 'Ctrl+F', tags: ['word'] },
  { id: 'laas', tittel: 'Lås datamaskinen', forklaring: 'Windows-tast+L', tags: ['windows'] },
  { id: 'cedilla', tittel: 'ç', forklaring: 'ALT+0231', tags: ['internasjonale tegn', 'windows'] },
  { id: 'oppgave', tittel: 'Opprett en oppgave', forklaring: 'Ctrl+Skift+K', tags: ['microsoft 365'] },
  { id: 'start', tittel: 'Start presentasjonen', forklaring: 'F5', tags: ['powerpoint'], undergruppe: 'Presentasjon' },
  { id: 'nytt', tittel: 'Nytt lysbilde', forklaring: 'Ctrl+M', tags: ['powerpoint'], undergruppe: 'Lysbilder' },
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

async function renderPage(locked: LockedContent | null = null) {
  const { Hurtigtaster } = await import('./Hurtigtaster')
  const auth = { unlocked: locked !== null, locked, initializing: false, unlock: async () => {}, lock: () => {} }
  await act(async () => {
    render(
      <AuthContext.Provider value={auth}>
        <Suspense fallback={null}><Hurtigtaster /></Suspense>
      </AuthContext.Provider>,
    )
  })
}

const headings = () => screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)

describe('Hurtigtaster', () => {
  it('groups by app in GROUPS order, entries alphabetically, and shows the keys without the tag', async () => {
    await renderPage()
    expect(headings()).toEqual(['Excel', 'PowerPoint', 'Word', 'Microsoft 365', 'Windows', 'Internasjonale tegn'])
    const word = document.getElementById('ord-punkt')!.parentElement!
    expect([...word.querySelectorAll('[id^="ord-"]')].map(r => r.id)).toEqual(['ord-fet', 'ord-punkt'])
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
    expect(headings()).toEqual(['Excel', 'Word', 'Microsoft 365'])
  })

  it('filters on one category with the chips, sorted alphabetically', async () => {
    await renderPage()
    const chips = screen.getByRole('group', { name: 'Filtrer på kategori' })
    const names = [...chips.querySelectorAll('button')].map(b => b.textContent!)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'nb')))
    const word = screen.getByRole('button', { name: 'Word', pressed: false })
    fireEvent.click(word)
    expect(word.getAttribute('aria-pressed')).toBe('true')
    expect(headings()).toEqual(['Word'])
    fireEvent.click(screen.getByRole('button', { name: 'Excel' }))
    expect(headings()).toEqual(['Excel'])
    fireEvent.click(screen.getByRole('button', { name: 'Excel', pressed: true }))
    expect(headings()).toEqual(['Excel', 'PowerPoint', 'Word', 'Microsoft 365', 'Windows', 'Internasjonale tegn'])
  })

  it('explains «+» and «,» between keys in the guide', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Veiledning' }))
    expect(screen.getByText('Trykk på Alt+F, slipp tastene og trykk på X')).toBeTruthy()
    expect(screen.getByText(/^Tastene gjelder en bærbar PC med norsk tastatur uten talltastatur, og Microsoft 365 på norsk\./)).toBeTruthy()
    expect(screen.getByText('I Word og Outlook: Skriv koden og trykk på Alt+X')).toBeTruthy()
  })

  it('finds an international character under its app name too', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'windows' } })
    expect(headings()).toEqual(['Windows', 'Internasjonale tegn'])
  })

  it('shows a gated section and its chip only when unlocked, sorted among the apps', async () => {
    await renderPage({
      hurtigtaster: [{ id: 'skjult', tittel: 'Skjult handling', forklaring: 'Ctrl+J', tags: ['skjult app'] }],
      hurtigtasterGrupper: [{ tag: 'skjult app', title: 'Skjult app' }],
    })
    expect(headings()).toEqual(['Excel', 'PowerPoint', 'Skjult app', 'Word', 'Microsoft 365', 'Windows', 'Internasjonale tegn'])
    expect(screen.getByRole('button', { name: 'Skjult app' })).toBeTruthy()
  })

  it('splits an app into its subheadings, in the given order', async () => {
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Lysbilder', 'Presentasjon'])
  })

  it('offers a subheading from part of its name and filters to it', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'lysbi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Vis alt under Lysbilder i PowerPoint' }))
    expect(headings()).toEqual(['PowerPoint'])
    expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Lysbilder'])
    fireEvent.click(screen.getByRole('button', { name: 'Fjern filter Lysbilder' }))
    expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Lysbilder', 'Presentasjon'])
  })

  it('shows only the section on a category chip, not rows that name the app as a second tag', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Windows' }))
    expect(headings()).toEqual(['Windows'])
  })

  it('keeps search hits in rank order, without subheadings', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'lysbilde' } })
    expect(screen.queryAllByRole('heading', { level: 3 })).toEqual([])
  })
})
