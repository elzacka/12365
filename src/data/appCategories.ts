import type { AppCategory } from '../types'

// Order is editorial: most-used groups first, niche tools last.
// fargeBakgrunn holds static class strings so Tailwind's JIT
// keeps them in the generated CSS.
export const APP_CATEGORIES: AppCategory[] = [
  {
    id: 'snakk-og-mot',
    navn: 'Snakke sammen, møtes',
    beskrivelse: 'Apper for kontakt med andre, fra formelle møter til hverdagsprat og åpne samtaler.',
    fargeBakgrunn: 'bg-sky-50',
  },
  {
    id: 'notater-og-tavler',
    navn: 'Notere, se tavler',
    beskrivelse: 'Tre måter å samle tekst og skisser på: Fast struktur, innhold som følger med på tvers av apper, eller fri plassering.',
    fargeBakgrunn: 'bg-amber-50',
  },
  {
    id: 'skriv-regn-presenter',
    navn: 'Skrive, regne, presentere',
    beskrivelse: 'Blant annet appene du kjenner fra «Office-pakken», for tekst, tall og lysbilder.',
    fargeBakgrunn: 'bg-emerald-50',
  },
  {
    id: 'lagre-og-del',
    navn: 'Lagre og dele',
    beskrivelse: 'Filer og innhold, enten det er ditt eget eller skal deles med andre.',
    fargeBakgrunn: 'bg-violet-50',
  },
  {
    id: 'spor-og-planlegg',
    navn: 'Planlegge, holde oversikt, spore',
    beskrivelse: 'Strukturert informasjon og oppgaver. Appene skiller seg på hvem som eier dataene, og om de er personlige eller for et team.',
    fargeBakgrunn: 'bg-rose-50',
  },
  {
    id: 'visualiser',
    navn: 'Visualisere',
    beskrivelse: 'Gjør data, prosesser og hendelser synlige. Valget avhenger av hva du skal vise.',
    fargeBakgrunn: 'bg-cyan-50',
  },
  {
    id: 'ki',
    navn: 'Få hjelp av KI',
    beskrivelse: 'Copilot-familien. Forskjellen ligger i hvilke data svarene bygger på, og om du bygger noe selv.',
    fargeBakgrunn: 'bg-indigo-50',
  },
  {
    id: 'bygg-og-automatiser',
    navn: 'Bygge, automatisere',
    beskrivelse: 'Lavkode for egne løsninger: En app, en flyt eller en agent.',
    fargeBakgrunn: 'bg-orange-50',
  },
  {
    id: 'laer-og-trives',
    navn: 'Trivsel, læring',
    beskrivelse: 'Kurs og opplæring, og råd om hvordan du bruker tiden din.',
    fargeBakgrunn: 'bg-lime-50',
  },
  {
    id: 'nettleser',
    navn: 'Nettleser',
    beskrivelse: 'Nettleseren du bruker til M365.',
    fargeBakgrunn: 'bg-slate-100',
  },
]

export const CATEGORY_BY_ID = new Map(APP_CATEGORIES.map(c => [c.id, c]))
