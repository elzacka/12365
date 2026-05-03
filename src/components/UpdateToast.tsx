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
      className="fixed left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-brand-700 text-white rounded-xl shadow-xl shadow-brand-900/30 flex items-center gap-2 pl-4 pr-2 py-2.5 bottom-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <p className="text-sm flex-1 leading-snug">Ny versjon er tilgjengelig</p>
      <button
        type="button"
        onClick={lastPaNytt}
        className="shrink-0 px-3 py-1.5 bg-white text-brand-700 text-sm font-semibold rounded-lg hover:bg-brand-50 active:bg-brand-100 transition-colors"
      >
        Last på nytt
      </button>
      <button
        type="button"
        onClick={lukk}
        className="shrink-0 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        aria-label="Lukk varsel"
      >
        <CloseIcon size={18} />
      </button>
    </div>
  )
}
