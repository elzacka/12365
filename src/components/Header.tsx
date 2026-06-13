import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ChevronLeftIcon, HomeIcon, LockIcon, LockOpenIcon } from './Icons'

interface HeaderProps {
  title?: string
  showHome?: boolean
  showBack?: boolean
  backTo?: string
  showLock?: boolean
  onLockClick?: () => void
}

export function Header({
  title,
  showHome = false,
  showBack = false,
  backTo = '/',
  showLock = false,
  onLockClick,
}: HeaderProps) {
  const { unlocked } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 safe-top">
      <div className="max-w-2xl mx-auto px-2 h-14 grid grid-cols-3 items-center">
        <div className="flex items-center gap-1 justify-self-start">
          {showBack && (
            <Link
              to={backTo}
              className="p-2.5 text-slate-500 hover:text-brand-700 transition-colors"
              aria-label="Tilbake"
            >
              <ChevronLeftIcon size={22} />
            </Link>
          )}
          {showHome && (
            <Link
              to="/"
              className="p-2.5 text-slate-500 hover:text-brand-700 transition-colors"
              aria-label="Til forsiden"
            >
              <HomeIcon size={20} />
            </Link>
          )}
        </div>

        <div className="justify-self-center min-w-0 px-2">
          {title ? (
            <h1 className="text-base font-semibold text-slate-800 truncate text-center">
              {title}
            </h1>
          ) : (
            <Link
              to="/"
              className="flex items-center justify-center"
              aria-label="12365 – til forsiden"
            >
              <img
                src={`${import.meta.env.BASE_URL}logo-header.svg`}
                alt="12365"
                className="h-10 w-auto"
                decoding="async"
              />
            </Link>
          )}
        </div>

        <div className="flex items-center justify-self-end">
          {showLock && onLockClick && (
            <button
              type="button"
              onClick={onLockClick}
              className={`p-2.5 transition-colors ${
                unlocked
                  ? 'text-brand-700 hover:text-brand-800'
                  : 'text-slate-500 hover:text-brand-700'
              }`}
              aria-label={unlocked ? 'Skjult innhold er låst opp – administrer' : 'Lås opp skjult innhold'}
              aria-pressed={unlocked}
              title={unlocked ? 'Skjult innhold låst opp' : 'Lås opp'}
            >
              {unlocked ? <LockOpenIcon size={20} /> : <LockIcon size={20} />}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
