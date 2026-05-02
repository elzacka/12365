import { Link } from 'react-router-dom'
import { ChevronLeftIcon, HomeIcon } from './Icons'

interface HeaderProps {
  tittel?: string
  visHjem?: boolean
  visTilbake?: boolean
  tilbakeTil?: string
}

export function Header({ tittel, visHjem = false, visTilbake = false, tilbakeTil = '/' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 safe-top">
      <div className="max-w-2xl mx-auto px-2 h-14 grid grid-cols-3 items-center">
        <div className="flex items-center justify-self-start">
          {visTilbake && (
            <Link
              to={tilbakeTil}
              className="p-2 text-slate-500 hover:text-brand-700 transition-colors"
              aria-label="Tilbake"
            >
              <ChevronLeftIcon size={22} />
            </Link>
          )}
          {visHjem && (
            <Link
              to="/"
              className="p-2 text-slate-500 hover:text-brand-700 transition-colors"
              aria-label="Til forsiden"
            >
              <HomeIcon size={20} />
            </Link>
          )}
        </div>

        <div className="justify-self-center min-w-0 px-2">
          {tittel ? (
            <h1 className="text-base font-semibold text-slate-800 truncate text-center">
              {tittel}
            </h1>
          ) : (
            <Link
              to="/"
              className="text-brand-700 font-bold text-lg tracking-tight"
              aria-label="12365 — til forsiden"
            >
              12365
            </Link>
          )}
        </div>

        <div className="justify-self-end" />
      </div>
    </header>
  )
}
