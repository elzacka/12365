import { Link } from 'react-router-dom'
import { ArrowLeftIcon, HomeIcon } from './Icons'

interface HeaderProps {
  tittel?: string
  visHjem?: boolean
  visTilbake?: boolean
  tilbakeTil?: string
}

export function Header({ tittel, visHjem = false, visTilbake = false, tilbakeTil = '/' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 safe-top">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        {visTilbake && (
          <Link
            to={tilbakeTil}
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-700 transition-colors py-1 pr-2"
            aria-label="Tilbake"
          >
            <ArrowLeftIcon size={20} />
            <span className="text-sm font-medium">Tilbake</span>
          </Link>
        )}

        {visHjem && (
          <Link
            to="/"
            className="flex items-center text-slate-500 hover:text-blue-700 transition-colors p-1"
            aria-label="Til forsiden"
          >
            <HomeIcon size={20} />
          </Link>
        )}

        {tittel && (
          <h1 className="flex-1 text-base font-semibold text-slate-800 truncate">
            {tittel}
          </h1>
        )}

        {!tittel && !visTilbake && (
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-bold text-lg tracking-tight">365 KI</span>
            <span className="text-xs text-slate-400 font-normal hidden sm:block">Microsoft 365-veileder</span>
          </div>
        )}
      </div>
    </header>
  )
}
