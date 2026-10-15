import { useEffect, useState } from 'react'
import { justUpdated, useAppUpdate } from '../lib/registerAppUpdate'
import { CheckIcon, RefreshIcon } from './Icons'

// Hvor lenge bekreftelsen etter oppdateringen står. Lik varigheten i
// animate-[update-done_…] under, som fader den ut mot slutten.
const CONFIRMATION_MS = 2600

// Brukeren bestemmer når en ny versjon tas i bruk. Reloaden fjerner knappen,
// så en hake på samme plass bekrefter at den virket, uten å dekke innhold.
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
        className="p-2.5 text-brand-700 animate-[update-done_2600ms_ease-in_forwards]"
        role="status"
        title="App oppdatert"
      >
        <CheckIcon size={20} />
        <span className="sr-only">App oppdatert</span>
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
