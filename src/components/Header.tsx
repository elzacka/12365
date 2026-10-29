import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ChevronLeftIcon, RunBackIcon, GlassesIcon, GlassesOffIcon } from './Icons'
import { UpdateButton } from './UpdateButton'

const HEADER_BUTTON = 'inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors'
const IDLE = 'border-slate-200 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-700'

interface HeaderProps {
  title?: string
  breadcrumb?: ReactNode
  showHome?: boolean
  showBack?: boolean
  backTo?: string
  showLock?: boolean
  onLockClick?: () => void
}

export function Header({
  title,
  breadcrumb,
  showHome = false,
  showBack = false,
  backTo = '/',
  showLock = false,
  onLockClick,
}: HeaderProps) {
  const { unlocked } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 safe-top">
      {/* Breadcrumb: centred like a title, but may grow past a third and truncate. */}
      <div className={`max-w-2xl mx-auto px-2 h-14 grid items-center ${breadcrumb ? 'grid-cols-[1fr_minmax(0,auto)_1fr]' : 'grid-cols-3'}`}>
        <div className="flex items-center gap-2 pl-1 justify-self-start">
          {showHome && (
            <Link
              to="/"
              className={`${HEADER_BUTTON} ${IDLE}`}
              aria-label="Til forsiden"
            >
              <RunBackIcon size={24} />
            </Link>
          )}
          {showBack && (
            <Link
              to={backTo}
              className={`${HEADER_BUTTON} ${IDLE}`}
              aria-label="Tilbake"
            >
              <ChevronLeftIcon size={22} />
            </Link>
          )}
        </div>

        <div className="justify-self-center min-w-0 px-2">
          {breadcrumb ?? (title ? (
            <h1 className="text-base font-semibold text-slate-800 truncate text-center">
              {title}
            </h1>
          ) : (
            <Link
              to="/"
              className="flex items-center justify-center"
              aria-label="1-2-365 – til forsiden"
            >
              <img
                src={`${import.meta.env.BASE_URL}logo-header.png`}
                alt="1-2-365"
                className="h-8 w-auto"
                decoding="async"
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 pr-1 justify-self-end">
          <UpdateButton />
          {showLock && onLockClick && (
            <button
              type="button"
              onClick={onLockClick}
              className={`${HEADER_BUTTON} ${
                unlocked
                  ? 'border-brand-300 bg-brand-50 text-brand-700 hover:text-brand-800'
                  : IDLE
              }`}
              aria-label={unlocked ? 'Skjult innhold er låst opp. Administrer' : 'Lås opp skjult innhold'}
              aria-pressed={unlocked}
              title={unlocked ? 'Skjult innhold låst opp' : 'Lås opp'}
            >
              {unlocked ? <GlassesIcon size={24} /> : <GlassesOffIcon size={24} />}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
