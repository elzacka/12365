import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { CloseIcon, LockIcon, LockOpenIcon } from './Icons'

interface LockModalProps {
  open: boolean
  onClose: () => void
}

export function LockModal({ open, onClose }: LockModalProps) {
  const { unlocked, unlock, lock } = useAuth()
  const [passphrase, setPassphrase] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset transient state every time the modal opens, and focus the field.
  useEffect(() => {
    if (!open) return
    setPassphrase('')
    setError(null)
    setBusy(false)
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !passphrase) return
    setBusy(true)
    setError(null)
    try {
      await unlock(passphrase, remember)
      onClose()
    } catch {
      setError('Feil passordfrase, eller låst innhold er ikke tilgjengelig.')
    } finally {
      setBusy(false)
    }
  }

  const handleLock = () => {
    lock()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2.5 text-brand-700">
            {unlocked ? <LockOpenIcon size={22} /> : <LockIcon size={22} />}
            <h2 id="lock-modal-title" className="text-base font-semibold text-slate-800">
              {unlocked ? 'Innhold låst opp' : 'Lås opp innhold'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Lukk"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {unlocked ? (
          <div className="px-5 pb-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              Du er logget inn på denne enheten og ser også skjult innhold. Logg ut for å skjule
              det igjen.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Lukk
              </button>
              <button
                type="button"
                onClick={handleLock}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 transition-colors"
              >
                Logg ut
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 pb-5">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Skriv inn passordfrasen for å se skjult innhold.
            </p>
            <label className="block">
              <span className="sr-only">Passordfrase</span>
              <input
                ref={inputRef}
                type="password"
                autoComplete="current-password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="Passordfrase"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'lock-error' : undefined}
              />
            </label>
            <label className="flex items-center gap-2 mt-3 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 accent-brand-700"
              />
              Husk på denne enheten
            </label>
            {error && (
              <p id="lock-error" className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={busy || !passphrase}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Sjekker …' : 'Lås opp'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
