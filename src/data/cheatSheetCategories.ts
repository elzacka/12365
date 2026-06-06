import type { CheatSheetCategory } from '../types'

// Order is editorial: most-used groups first, niche tools last.
// fargeBakgrunn / fargeAksent are static class strings so Tailwind's JIT
// keeps them in the generated CSS.
export const CHEAT_SHEET_CATEGORIES: CheatSheetCategory[] = [
  {
    id: 'snakk-og-mot',
    navn: 'Snakke sammen, møtes',
    beskrivelse: 'Alle handler om kontakt med kolleger. Skillet er formell e-post, hverdagsprat eller åpen samtale.',
    fargeBakgrunn: 'bg-sky-50',
    fargeAksent: 'ring-sky-300',
  },
  {
    id: 'notater-og-tavler',
    navn: 'Notere, se tavler',
    beskrivelse: 'Tre måter å holde tekst og skisser sammen. Skillet er fast struktur, flyt på tvers eller åpen plassering.',
    fargeBakgrunn: 'bg-amber-50',
    fargeAksent: 'ring-amber-300',
  },
  {
    id: 'skriv-regn-presenter',
    navn: 'Skrive, regne, presentere',
    beskrivelse: 'Bl.a det du kjenner fra «Office-pakken». Tekst, tall og lysbilder for ulike formater og lesere.',
    fargeBakgrunn: 'bg-emerald-50',
    fargeAksent: 'ring-emerald-300',
  },
  {
    id: 'lagre-og-del',
    navn: 'Lagre og dele filer + annet',
    beskrivelse: 'Filer og innhold. Skillet er om det er ditt eget eller ment for flere enn deg.',
    fargeBakgrunn: 'bg-violet-50',
    fargeAksent: 'ring-violet-300',
  },
  {
    id: 'spor-og-planlegg',
    navn: 'Planlegge, holde oversikt, spore',
    beskrivelse: 'Strukturert info og oppgaver. Skillet er hvem som eier dataene og om det er personlig eller for team.',
    fargeBakgrunn: 'bg-rose-50',
    fargeAksent: 'ring-rose-300',
  },
  {
    id: 'visualiser',
    navn: 'Visualisere',
    beskrivelse: 'Gjøre data, prosesser og hendelser synlige. Skillet er hva slags innhold som skal vises.',
    fargeBakgrunn: 'bg-cyan-50',
    fargeAksent: 'ring-cyan-300',
  },
  {
    id: 'ki',
    navn: 'Få hjelp av KI',
    beskrivelse: 'Copilot-familien. Skillet er datagrunnlaget som svarene/outputen baserer seg på og om du bygger noe selv.',
    fargeBakgrunn: 'bg-indigo-50',
    fargeAksent: 'ring-indigo-300',
  },
  {
    id: 'bygg-og-automatiser',
    navn: 'Bygge, automatisere',
    beskrivelse: 'Lavkode for å lage egne løsninger. Skillet er om du bygger en app, flyt eller agent.',
    fargeBakgrunn: 'bg-orange-50',
    fargeAksent: 'ring-orange-300',
  },
  {
    id: 'laer-og-trives',
    navn: 'Trivsel, læring',
    beskrivelse: 'Personlig vekst og bedre arbeidsdag. Skillet er om det handler om kunnskap eller egen tid.',
    fargeBakgrunn: 'bg-lime-50',
    fargeAksent: 'ring-lime-300',
  },
  {
    id: 'nettleser',
    navn: 'Nettleser',
    beskrivelse: 'Inngangen til alt på nett.',
    fargeBakgrunn: 'bg-slate-100',
    fargeAksent: 'ring-slate-300',
  },
]

export const CATEGORY_BY_ID = new Map(CHEAT_SHEET_CATEGORIES.map(c => [c.id, c]))
