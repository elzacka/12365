import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { MenuIcon } from './Icons'

const ITEM = 'flex w-full items-center px-4 py-3 text-base text-slate-700 hover:bg-slate-50 cursor-pointer'

interface HeaderMenuProps {
  buttonClassName: string
  onLockClick: () => void
}

// Disclosure, not an ARIA menu: Tab moves through the items, which a menu role would forbid.
export function HeaderMenu({ buttonClassName, onLockClick }: HeaderMenuProps) {
  const { unlocked } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={buttonClassName}
        aria-label="Meny"
        aria-expanded={open}
        aria-controls={listId}
      >
        <MenuIcon size={22} />
      </button>
      {open && (
        <ul
          id={listId}
          className="absolute right-0 top-full mt-2 min-w-48 py-1 rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <li>
            <button
              type="button"
              className={ITEM}
              onClick={() => {
                setOpen(false)
                onLockClick()
              }}
            >
              {unlocked ? 'Lås' : 'Lås opp'}
            </button>
          </li>
          <li>
            <Link to="/om" className={ITEM} onClick={() => setOpen(false)}>
              Om
            </Link>
          </li>
          <li>
            <Link to="/personvern" className={ITEM} onClick={() => setOpen(false)}>
              Personvern
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/elzacka/12365"
              target="_blank"
              rel="noopener noreferrer"
              className={ITEM}
              onClick={() => setOpen(false)}
            >
              Kildekode
              <span className="sr-only"> (åpnes i ny fane)</span>
            </a>
          </li>
        </ul>
      )}
    </div>
  )
}
