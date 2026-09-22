import { useEffect, useState } from 'react'
import { justUpdated, useAppUpdate } from '../lib/registerAppUpdate'
import { CheckIcon, RefreshIcon } from './Icons'

// Hvor lenge bekreftelsen etter oppdateringen står før den fader ut.
const CONFIRMATION_MS = 2600

// Stille header-knapp som dukker opp når en ny versjon ligger klar.
// Brukeren bestemmer når den tas i bruk - ingenting byttes ut under dem.
// Selve oppdateringen laster siden på nytt, og da forsvinner knappen uten at
// brukeren nødvendigvis rekker å se hvorfor. Derfor møter en liten kvittering
// dem på den nye siden. Den ligger fast posisjonert under headeren, så
// ingenting i layouten flytter seg når den kommer og går.
export function UpdateButton() {
  const { ready, applying, apply } = useAppUpdate()
  const [confirming, setConfirming] = useState(justUpdated)

  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), CONFIRMATION_MS)
    return () => clearTimeout(timer)
  }, [confirming])

  if (confirming) {
    return (
      <span
        className="pointer-events-none fixed left-1/2 top-16 z-50 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-[13px] font-medium text-white shadow-lg"
        role="status"
      >
        <CheckIcon size={14} />
        Appen er oppdatert
      </span>
    )
  }

  if (!ready) return null

  const handleClick = () => {
    // Kort vibrasjon der nettleseren støtter det - bekrefter trykket på
    // mobil i det halve sekundet før siden lastes på nytt.
    navigator.vibrate?.(10)
    void apply()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={applying}
      aria-busy={applying}
      className="p-2.5 text-brand-700 hover:text-brand-800 active:text-brand-900 transition-colors disabled:cursor-default touch-manipulation"
      aria-label="Ny versjon er klar – oppdater appen"
      title="Oppdater appen"
    >
      <RefreshIcon
        size={20}
        className={applying ? 'animate-spin motion-reduce:animate-none' : undefined}
      />
      <span role="status" className="sr-only">
        {applying ? 'Oppdaterer appen' : ''}
      </span>
    </button>
  )
}
