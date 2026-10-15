import { Link } from 'react-router-dom'
import { AppsIcon, SchoolIcon, BookIcon, JukselappIcon, Stack2Icon, InfoSquareIcon } from '../components/Icons'

interface NavCardProps {
  to: string
  icon: React.ReactNode
  title: string
}

function NavCard({ to, icon, title }: NavCardProps) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col items-center justify-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 text-center select-none"
    >
      <div className="w-12 h-12 flex items-center justify-center text-brand-400 [&_svg]:[stroke-width:1.5] group-hover:scale-105 transition-transform duration-200">
        {icon}
      </div>
      <div className="text-base font-semibold text-brand-700 leading-snug">{title}</div>
    </Link>
  )
}

export function Home() {
  return (
    <main className="flex-1 bg-slate-50 px-4 pt-10 pb-8">
      <h1 className="sr-only">1-2-365</h1>
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        <NavCard to="/om-appene" icon={<AppsIcon size={40} />} title="Appene" />
        <NavCard to="/opplaering" icon={<SchoolIcon size={40} />} title="Se og hør" />
        <NavCard to="/slik-gjor-du" icon={<BookIcon size={40} />} title="Gjør sånn" />
        <NavCard to="/oppslagsverk" icon={<JukselappIcon size={40} />} title="Jukselapp" />
        <NavCard to="/lisenser" icon={<Stack2Icon size={40} />} title="Alt i E5" />
        <NavCard to="/om-appen" icon={<InfoSquareIcon size={40} />} title="Om" />
      </div>
    </main>
  )
}
