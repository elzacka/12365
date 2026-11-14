import { use } from 'react'
import { fetchHurtigtaster } from '../data/loader'
import { OppslagView, type SearchExample } from '../components/OppslagView'
import { GROUPS } from '../data/hurtigtaster'

const PLACEHOLDER_WORDS = ['handling', 'tast', 'app']

const EXAMPLES: SearchExample[] = [
  { kode: 'mikrofon', beskrivelse: 'viser alle hurtigtaster med «mikrofon» i tittel eller forklaring' },
  { kode: 'skift', beskrivelse: 'viser alle hurtigtaster med Skift-tasten' },
  { kode: 'outlook', beskrivelse: 'viser alle hurtigtaster med emneknaggen #outlook' },
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
