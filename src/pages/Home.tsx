import { Link } from 'react-router-dom'
import { GridIcon, BookOpenIcon, LayersIcon } from '../components/Icons'
import { UpdateDot } from '../components/UpdateDot'
import { useSeenVersions } from '../lib/SeenVersionsContext'

interface NavCardProps {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  color: string
  showDot?: boolean
}

function NavCard({ to, icon, title, description, color, showDot }: NavCardProps) {
  return (
    <Link
      to={to}
      className={`
        group relative flex flex-col items-center gap-4 p-7 rounded-2xl border border-slate-200
        bg-white shadow-sm hover:shadow-md active:scale-[0.98]
        transition-all duration-200 text-center select-none
      `}
    >
      <UpdateDot visible={!!showDot} className="absolute top-3 right-3" />
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${color} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-slate-800 mb-1">{title}</div>
        <div className="text-sm text-slate-500 leading-relaxed">{description}</div>
      </div>
    </Link>
  )
}

export function Home() {
  const { hasNewCards, hasNewArticles, hasNewLicense, hasNewVideos, hasNewAbout } = useSeenVersions()

  return (
    <main className="flex-1 bg-slate-50 px-4 pt-10 pb-8">
      <h1 className="sr-only">12365 – M365 på 1-2-3</h1>
      <div className="max-w-lg mx-auto space-y-4">
        <NavCard
          to="/om-appene"
          icon={<GridIcon size={30} />}
          title="Om M365-appene"
          description="Hva brukes de til, hva skiller dem og hvordan samarbeider de?"
          color="bg-brand-700"
          showDot={hasNewCards}
        />
        <NavCard
          to="/slik-gjor-du"
          icon={<BookOpenIcon size={30} />}
          title="Slik gjør du"
          description="...for å utnytte mulighetene i appene"
          color="bg-brand-700"
          showDot={hasNewArticles}
        />
        <NavCard
          to="/lisenser"
          icon={<LayersIcon size={30} />}
          title="Hva følger med i E5-lisensen?"
          description="– og hva bruker du de ulike tingene til?"
          color="bg-brand-700"
          showDot={hasNewLicense}
        />
      </div>

      <nav className="mt-6 grid grid-cols-2 gap-3 max-w-lg mx-auto" aria-label="Mer">
        <Link
          to="/videoer"
          className="relative flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm active:scale-[0.98] transition-all"
        >
          <UpdateDot visible={hasNewVideos} className="absolute top-2 right-2" />
          Videoer
        </Link>
        <Link
          to="/om-appen"
          className="relative flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm active:scale-[0.98] transition-all"
        >
          <UpdateDot visible={hasNewAbout} className="absolute top-2 right-2" />
          Om appen
        </Link>
      </nav>
    </main>
  )
}
