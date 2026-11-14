import type { OppslagGroup } from '../types'

// Hurtigtaster sections; each entry's first tag is its section.
// Apps outside E5 (Project, Visio desktop) are left out.
const APPS: OppslagGroup[] = [
  { tag: 'chrome', title: 'Chrome' },
  { tag: 'edge', title: 'Edge' },
  { tag: 'excel', title: 'Excel' },
  { tag: 'onedrive', title: 'OneDrive' },
  { tag: 'onenote', title: 'OneNote' },
  { tag: 'outlook', title: 'Outlook' },
  { tag: 'powerpoint', title: 'PowerPoint', undergrupper: ['Lage, åpne og lagre', 'Skrive, merke og slette tekst', 'Flytte i teksten', 'Formatere tekst', 'Kopiere, lime inn og angre', 'Sette inn', 'Lysbilder', 'Figurer og objekter', 'Tabeller', 'Søke og erstatte', 'Visning og zoom', 'Valgruten', 'Båndet, menyer og ruter', 'Presentasjon'] },
  { tag: 'teams', title: 'Teams', undergrupper: ['Møter, samtaler og kalender', 'Chat og navigering'] },
  { tag: 'word', title: 'Word' },
]

const GENERAL: OppslagGroup[] = [
  { tag: 'microsoft 365', title: 'Microsoft 365' },
  { tag: 'windows', title: 'Windows' },
  { tag: 'tegn/emojis', title: 'Tegn/Emojis' },
  { tag: 'internasjonale tegn', title: 'Internasjonale tegn' },
]

/** Apps A–Z, gated ones included, then the general sections. */
export function hurtigtastGroups(gated: OppslagGroup[] = []): OppslagGroup[] {
  return [...APPS, ...gated].sort((a, b) => a.title.localeCompare(b.title, 'nb')).concat(GENERAL)
}

export const GROUPS = hurtigtastGroups()
