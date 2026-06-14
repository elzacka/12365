import { Link } from 'react-router-dom'
import { GridIcon, BookOpenIcon, GraduationCapIcon, LayersIcon, SearchIcon, InfoIcon } from '../components/Icons'
import { UpdateDot } from '../components/UpdateDot'
import { useSeenVersions } from '../lib/SeenVersionsContext'

interface NavCardProps {
  to: string
  icon: React.ReactNode
  title: string
  color: string
  showDot?: boolean
}

function NavCard({ to, icon, title, color, showDot }: NavCardProps) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col items-center justify-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 text-center select-none"
    >
      <UpdateDot visible={!!showDot} className="absolute top-2 right-2" />
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-sm group-hover:scale-105 transition-transform duration-200`}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold text-slate-800 leading-snug">{title}</div>
    </Link>
  )
}

export function Home() {
  const { hasNewCards, hasNewArticles, hasNewLicense, hasNewVideos, hasNewCourses, hasNewOrdbok, hasNewAbout } = useSeenVersions()

  return (
    <main className="flex-1 bg-slate-50 px-4 pt-10 pb-8">
      <h1 className="sr-only">12365 – M365 på 1-2-3</h1>
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        <NavCard
          to="/om-appene"
          icon={<GridIcon size={24} />}
          title="M365-appene"
          color="bg-brand-700"
          showDot={hasNewCards}
        />
        <NavCard
          to="/opplaering"
          icon={<GraduationCapIcon size={24} />}
          title="Opplæring"
          color="bg-brand-700"
          showDot={hasNewVideos || hasNewCourses}
        />
        <NavCard
          to="/slik-gjor-du"
          icon={<BookOpenIcon size={24} />}
          title="Slik gjør du"
          color="bg-brand-700"
          showDot={hasNewArticles}
        />
        <NavCard
          to="/ordbok"
          icon={<SearchIcon size={24} />}
          title="Ordbok"
          color="bg-brand-700"
          showDot={hasNewOrdbok}
        />
        <NavCard
          to="/lisenser"
          icon={<LayersIcon size={24} />}
          title="Hva følger med i E5-lisensen?"
          color="bg-brand-700"
          showDot={hasNewLicense}
        />
        <NavCard
          to="/om-appen"
          icon={<InfoIcon size={24} />}
          title="Om appen"
          color="bg-brand-700"
          showDot={hasNewAbout}
        />
      </div>
    </main>
  )
}
