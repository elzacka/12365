import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { CloseIcon } from './Icons'

type Oppdaterer = (reload?: boolean) => Promise<void>

export function UpdateToast() {
  const [trengsOppdatering, setTrengsOppdatering] = useState(false)
  const [oppdater, setOppdater] = useState<Oppdaterer | null>(null)

  useEffect(() => {
    const fn = registerSW({
      onNeedRefresh() {
        setTrengsOppdatering(true)
      },
    })
    setOppdater(() => fn)
  }, [])

  if (!trengsOppdatering) return null

  const lastPaNytt = () => {
    void oppdater?.(true)
  }

  const lukk = () => {
    setTrengsOppdatering(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-50 bg-brand-700 text-white rounded-lg shadow-lg flex items-center gap-3 p-3 safe-bottom"
    >
      <p className="text-sm flex-1 leading-snug">Ny versjon er tilgjengelig.</p>
      <button
        type="button"
        onClick={lastPaNytt}
        className="px-3 py-1.5 bg-white text-brand-700 text-sm font-semibold rounded hover:bg-brand-50 transition-colors"
      >
        Last på nytt
      </button>
      <button
        type="button"
        onClick={lukk}
        className="p-1 text-white/80 hover:text-white transition-colors"
        aria-label="Lukk"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  )
}
