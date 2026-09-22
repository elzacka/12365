import { useAppUpdate } from '../lib/registerAppUpdate'
import { RefreshIcon } from './Icons'

// Stille header-knapp som dukker opp når en ny versjon ligger klar.
// Brukeren bestemmer når den tas i bruk - ingenting byttes ut under dem.
export function UpdateButton() {
  const { ready, apply } = useAppUpdate()

  if (!ready) return null

  return (
    <button
      type="button"
      onClick={apply}
      className="p-2.5 text-brand-700 hover:text-brand-800 transition-colors"
      aria-label="Ny versjon er klar – oppdater appen"
      title="Oppdater appen"
    >
      <RefreshIcon size={20} />
    </button>
  )
}
