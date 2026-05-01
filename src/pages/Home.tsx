import { Link } from 'react-router-dom'
import { GridIcon, BookOpenIcon } from '../components/Icons'

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
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-700 to-blue-800 text-white px-4 pt-10 pb-12 text-center">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-2">Microsoft 365-veileder</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
          Velkommen til din nye arbeidsflate
        </h1>
        <p className="text-blue-100 text-base max-w-sm mx-auto leading-relaxed">
          Her finner du oversikt over appene og steg-for-steg-veiledninger for hverdagen i M365.
        </p>
      </div>

      {/* Bølge-separator */}
      <div className="bg-blue-800 h-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-slate-50 rounded-t-[2rem]" />
      </div>

      {/* Navigasjonskort */}
      <main className="flex-1 bg-slate-50 px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto space-y-4">
          <NavKort
            til="/om-appene"
            ikon={<GridIcon size={30} />}
            tittel="Om appene"
            beskrivelse="Hva gjør hver app — og hvordan henger de sammen?"
            farge="bg-blue-700"
          />
          <NavKort
            til="/slik-gjor-du"
            ikon={<BookOpenIcon size={30} />}
            tittel="Slik gjør du"
            beskrivelse="Steg-for-steg-veiledninger for hverdagsoppgaver i M365"
            farge="bg-indigo-600"
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Spørsmål? Ta kontakt med IT-avdelingen eller en superbruker.
        </p>
      </main>
    </div>
  )
}
