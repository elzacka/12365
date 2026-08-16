import { useEffect, useRef } from 'react'
import { CloseIcon, PlusIcon, ShareIcon } from './Icons'

interface InstallSheetProps {
  variant: 'ios-safari' | 'macos-safari'
  isIPad: boolean
  onClose: () => void
}

export function InstallSheet({ variant, isIPad, onClose }: InstallSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => closeButtonRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const title = variant === 'ios-safari' ? 'Legg til på Hjem-skjerm' : 'Legg til i Dock'
  const firstStep =
    variant === 'ios-safari'
      ? `Trykk på Del-ikonet ${isIPad ? 'øverst' : 'nederst'} i Safari.`
      : 'Klikk på Del-ikonet i verktøylinjen i Safari.'
  const secondStep =
    variant === 'ios-safari'
      ? 'Velg «Legg til på Hjem-skjerm», og bekreft med «Legg til».'
      : 'Velg «Legg til i Dock».'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 id="install-sheet-title" className="text-base font-semibold text-slate-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Lukk"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <ol className="px-5 pb-2 flex flex-col gap-4">
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-700 shrink-0">
              <ShareIcon size={16} />
            </span>
            <p className="text-sm text-slate-700 leading-snug pt-1.5">{firstStep}</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-700 shrink-0">
              <PlusIcon size={16} />
            </span>
            <p className="text-sm text-slate-700 leading-snug pt-1.5">{secondStep}</p>
          </li>
        </ol>

        <div className="px-5 pb-5 pt-3 flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 transition-colors"
          >
            Skjønner
          </button>
        </div>
      </div>
    </div>
  )
}
