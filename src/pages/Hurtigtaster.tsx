import { use } from 'react'
import { fetchHurtigtaster } from '../data/loader'
import { OppslagView, type SearchExample } from '../components/OppslagView'
import { useMergedHurtigtaster } from '../auth/merge'

const PLACEHOLDER_WORDS = ['handling', 'tast', 'app']

const EXAMPLES: SearchExample[] = [
  { kode: 'mikrofon', beskrivelse: 'viser alle hurtigtaster med «mikrofon» i beskrivelsen' },
  { kode: 'skift', beskrivelse: 'viser alle hurtigtaster med Skift-tasten' },
  { kode: 'outlook', beskrivelse: 'viser alle hurtigtaster i Outlook' },
]

export function Hurtigtaster() {
  const { ord, groups } = useMergedHurtigtaster(use(fetchHurtigtaster()))
  return (
    <OppslagView
      ord={ord}
      placeholderWords={PLACEHOLDER_WORDS}
      searchLabel="Søk i hurtigtastene"
      examples={EXAMPLES}
      resetLabel="Vis alle hurtigtastene"
      groups={groups}
      keys
    />
  )
}
