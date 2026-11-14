import { use } from 'react'
import { fetchJukselapp } from '../data/loader'
import { OppslagView, type SearchExample } from '../components/OppslagView'

const PLACEHOLDER_WORDS = ['ord', 'beskrivelse', 'emneknagg']

const EXAMPLES: SearchExample[] = [
  { kode: 'S', beskrivelse: 'viser alle oppslag som begynner med S' },
  { kode: 'metadata', beskrivelse: 'viser alle oppslag med «metadata» i tittel eller forklaring' },
  { kode: 'teams', beskrivelse: 'viser alle oppslag med emneknaggen #teams' },
]

export function Jukselapp() {
  return (
    <OppslagView
      ord={use(fetchJukselapp())}
      placeholderWords={PLACEHOLDER_WORDS}
      searchLabel="Søk i jukselappen"
      examples={EXAMPLES}
      resetLabel="Vis hele jukselappen"
    />
  )
}
