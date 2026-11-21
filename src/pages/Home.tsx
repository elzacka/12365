import { Link } from 'react-router-dom'
import { AppsIcon, SchoolIcon, BookIcon, JukselappIcon, BoltIcon, Stack2Icon, ScaleIcon } from '../components/Icons'

interface NavCardProps {
  to: string
  icon: React.ReactNode
  title: string
  beta?: boolean
  className?: string
}

function NavCard({ to, icon, title, beta, className = '' }: NavCardProps) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col items-center justify-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 text-center select-none overflow-hidden ${className}`}
    >
      <div className="w-12 h-12 flex items-center justify-center text-brand-400 [&_svg]:[stroke-width:1.5] group-hover:scale-105 transition-transform duration-200">
        {icon}
      </div>
      <div className="text-base font-semibold text-brand-700 leading-snug">{title}</div>
      {beta && (
        <span className="absolute top-3 -right-8 w-28 rotate-45 bg-brand-500 py-0.5 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-white shadow-sm">
          beta
        </span>
      )}
    </Link>
  )
}

export function Home() {
  return (
    <main className="flex-1 bg-slate-50 pb-8">
      <h1 className="sr-only">1-2-365</h1>
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3 px-4 pt-10">
        <NavCard to="/appene" icon={<AppsIcon size={40} />} title="Appene" />
        <NavCard to="/se-og-hor" icon={<SchoolIcon size={40} />} title="Se og hør" />
        <NavCard to="/gjor-sann" icon={<BookIcon size={40} />} title="Gjør sånn" />
        <NavCard to="/jukselapp" icon={<JukselappIcon size={40} />} title="Jukselapp" />
        <NavCard to="/hurtigtaster" icon={<BoltIcon size={40} />} title="Hurtigtaster" />
        <NavCard to="/alt-i-e5-og-e7" icon={<Stack2Icon size={40} />} title="Alt i E5 og E7" />
        {/* Odd one out: centred on its own row at the width of one column. */}
        <NavCard
          to="/ki-vurdering"
          icon={<ScaleIcon size={40} />}
          title="KI-vurdering"
          beta
          className="col-span-2 justify-self-center w-[calc(50%-0.375rem)]"
        />
      </div>
    </main>
  )
}
