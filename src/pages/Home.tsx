import { Link } from 'react-router-dom'
import { GridIcon, BookOpenIcon, VideoIcon } from '../components/Icons'

interface NavKortProps {
  til: string
  ikon: React.ReactNode
  tittel: string
  beskrivelse: string
  farge: string
}

function NavKort({ til, ikon, tittel, beskrivelse, farge }: NavKortProps) {
  return (
    <Link
      to={til}
      className={`
        group flex flex-col items-center gap-4 p-7 rounded-2xl border border-slate-200
        bg-white shadow-sm hover:shadow-md active:scale-[0.98]
        transition-all duration-200 text-center select-none
      `}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${farge} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
        {ikon}
      </div>
      <div>
        <div className="text-lg font-semibold text-slate-800 mb-1">{tittel}</div>
        <div className="text-sm text-slate-500 leading-relaxed">{beskrivelse}</div>
      </div>
    </Link>
  )
}

export function Home() {
  return (
    <main className="flex-1 bg-slate-50 px-4 pt-10 pb-8">
      <h1 className="sr-only">12365 — Microsoft 365 på 1-2-3</h1>
      <div className="max-w-lg mx-auto space-y-4">
        <NavKort
          til="/om-appene"
          ikon={<GridIcon size={30} />}
          tittel="Om appene"
          beskrivelse="Hva gjør hver app — og hvordan henger de sammen?"
          farge="bg-brand-700"
        />
        <NavKort
          til="/slik-gjor-du"
          ikon={<BookOpenIcon size={30} />}
          tittel="Slik gjør du"
          beskrivelse="Steg-for-steg-veiledninger for hverdagsoppgaver i M365"
          farge="bg-brand-700"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          to="/videoer"
          aria-label="Videoer"
          className="p-3 text-slate-400 hover:text-brand-700 hover:bg-white rounded-full transition-colors"
        >
          <VideoIcon size={22} />
        </Link>
      </div>
    </main>
  )
}
