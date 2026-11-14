import { use } from 'react'
import { fetchHurtigtaster } from '../data/loader'
import { OppslagView, type SearchExample } from '../components/OppslagView'
import { GROUPS } from '../data/hurtigtaster'

const PLACEHOLDER_WORDS = ['handling', 'tast', 'app']

const EXAMPLES: SearchExample[] = [
  { kode: 'mikrofon', beskrivelse: 'viser alle hurtigtaster med «mikrofon» i beskrivelsen' },
  { kode: 'skift', beskrivelse: 'viser alle hurtigtaster med Skift-tasten' },
  { kode: 'outlook', beskrivelse: 'viser alle hurtigtaster i nye og klassisk Outlook' },
]

export function Hurtigtaster() {
  return (
    <OppslagView
      ord={use(fetchHurtigtaster())}
      placeholderWords={PLACEHOLDER_WORDS}
      searchLabel="Søk i hurtigtastene"
      examples={EXAMPLES}
      resetLabel="Vis alle hurtigtastene"
      groups={GROUPS}
      keys
    />
  )
}
