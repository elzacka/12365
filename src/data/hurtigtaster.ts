import type { OppslagGroup } from '../types'

// Hurtigtaster sections; each entry's first tag is its section.
// Apps outside E5 (Project, Visio desktop) are left out.
const APPS: OppslagGroup[] = [
  { tag: 'chrome', title: 'Chrome', undergrupper: ['Faner', 'Adresselinjen og søk', 'Navigere, rulle og zoome', 'Vinduer', 'Bokmerker og logg', 'Lagre, skrive ut og tekst', 'Fokus, menyer og verktøy'] },
  { tag: 'edge', title: 'Edge', undergrupper: ['Faner', 'Adresselinjen og søk', 'Navigere, rulle og zoome', 'Vinduer', 'Favoritter og logg', 'Lagre, skrive ut og lese', 'Fokus, menyer og verktøy'] },
  { tag: 'excel', title: 'Excel', undergrupper: ['Lage, åpne og lagre', 'Kopiere, lime inn og angre', 'Skrive og redigere i celler', 'Flytte i regnearket', 'Merke celler', 'Formatere celler', 'Formler og funksjoner', 'Data, diagrammer og makroer', 'Visning og vinduer', 'Copilot i Excel', 'Power Pivot', 'Båndet, menyer og ruter'] },
  { tag: 'onedrive', title: 'OneDrive' },
  { tag: 'onenote', title: 'OneNote', undergrupper: ['Lage, åpne og lagre', 'Skrive, merke og slette tekst', 'Kopiere, lime inn og angre', 'Flytte i teksten', 'Formatere tekst', 'Sette inn', 'Tabeller', 'Notatkoder og oppgaver', 'Disposisjoner', 'Søke', 'Visning og zoom', 'Sider og inndelinger', 'Menyer og ruter'] },
  { tag: 'outlook', title: 'Outlook', undergrupper: ['Skrive og sende e-post', 'Lese og håndtere e-post', 'Formatere tekst', 'Kopiere, lime inn og angre', 'Søke og erstatte', 'Kalender og møter', 'Kontakter', 'Oppgaver', 'Mapper og lister', 'Sending og mottak', 'Skrive ut og lagre', 'Bytte visning', 'Båndet, menyer og ruter'] },
  { tag: 'powerpoint', title: 'PowerPoint', undergrupper: ['Lage, åpne og lagre', 'Skrive, merke og slette tekst', 'Flytte i teksten', 'Formatere tekst', 'Kopiere, lime inn og angre', 'Sette inn', 'Lysbilder', 'Figurer og objekter', 'Tabeller', 'Søke og erstatte', 'Visning og zoom', 'Valgruten', 'Båndet, menyer og ruter', 'Presentasjon'] },
  { tag: 'teams', title: 'Teams', undergrupper: ['I møter og samtaler', 'Dele innhold', 'Skrive meldinger', 'Formatere meldinger', 'Chatter og kanaler', 'Kalendervisninger', 'Planlegge møter', 'Aktivitet', 'Visning og zoom', 'Innstillinger og hjelp', 'Ruter, faner og fokus'] },
  { tag: 'word', title: 'Word', undergrupper: ['Lage, åpne og lagre', 'Kopiere, lime inn og angre', 'Skrive, merke og slette tekst', 'Formatere tekst', 'Avsnitt, stiler og disposisjon', 'Flytte i dokumentet', 'Søke og gå til', 'Sette inn', 'Tabeller', 'Visning, zoom og utskrift', 'Gjennomgang og referanser', 'Felt, flettinger og makroer', 'Båndet, menyer og ruter'] },
]

const GENERAL: OppslagGroup[] = [
  { tag: 'microsoft 365', title: 'Microsoft 365', undergrupper: ['Lage, åpne og lagre', 'Skrive ut og eksportere', 'Formatere tekst', 'Flytte i teksten', 'Kopiere, lime inn og angre', 'Skrive, merke og slette tekst', 'Figurer og objekter', 'Info, konto og alternativer', 'Båndet, menyer og ruter'] },
  { tag: 'windows', title: 'Windows' },
  { tag: 'tegn/emojis', title: 'Tegn/Emojis' },
  { tag: 'internasjonale tegn', title: 'Internasjonale tegn', undergrupper: ['Grav og akutt aksent', 'Trema', 'Sirkumfleks og tilde', 'Andre bokstaver og tegn', 'Ctrl-kombinasjoner i Word'] },
]

/** Apps A–Z, gated ones included, then the general sections. */
export function hurtigtastGroups(gated: OppslagGroup[] = []): OppslagGroup[] {
  return [...APPS, ...gated].sort((a, b) => a.title.localeCompare(b.title, 'nb')).concat(GENERAL)
}

export const GROUPS = hurtigtastGroups()
