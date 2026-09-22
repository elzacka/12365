import { useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'

// Periodic Background Sync er ikke i TypeScripts DOM-lib ennå.
interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>
}
interface ServiceWorkerRegistrationWithPeriodicSync extends ServiceWorkerRegistration {
  readonly periodicSync: PeriodicSyncManager
}

// Fanger opp nye versjoner selv i lange, sammenhengende økter der brukeren
// aldri navigerer og dermed aldri utløser nettleserens egen service
// worker-sjekk.
const CHECK_INTERVAL_MS = 60 * 60 * 1000

// Nettleseren garanterer uansett ikke hyppigere kjøring enn dette - kun en
// nedre grense å be om.
const PERIODIC_SYNC_MIN_INTERVAL_MS = 12 * 60 * 60 * 1000

// Hvor lenge vi venter på at den nye service workeren tar over før vi laster
// siden på nytt uansett. Aktivering av en ferdig nedlastet worker tar
// millisekunder; blir det stille lenger enn dette, er den ventende workeren
// borte (typisk tatt i bruk av en annen fane) og en reload gir uansett
// nyeste versjon.
const CONTROLLER_TIMEOUT_MS = 2500

// Overlever reloaden oppdateringen utløser, så knappen kan bekrefte at den
// faktisk gjorde noe. sessionStorage, ikke localStorage: bekreftelsen hører
// til denne fanen og denne hendelsen.
const APPLIED_FLAG = '1-2-365:oppdatert'

// Chrome gir aldri tillatelse via en synlig dialog - kun stille, basert på
// egne engasjement-kriterier for installerte apper. Ingen effekt på
// nettlesere uten støtte, eller når tillatelsen (ennå) ikke er gitt.
async function registerPeriodicContentRefresh(registration: ServiceWorkerRegistration) {
  if (!('periodicSync' in registration)) return
  try {
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync',
    } as unknown as PermissionDescriptor)
    if (status.state !== 'granted') return
    await (registration as ServiceWorkerRegistrationWithPeriodicSync).periodicSync.register('refresh-content', {
      minInterval: PERIODIC_SYNC_MIN_INTERVAL_MS,
    })
  } catch {
    // Ukjent tillatelsesnavn kaster på nettlesere uten støtte - stille no-op.
  }
}

// Én modul-global tilstand: registerSW() skal kalles nøyaktig én gang, mens
// Header monteres på nytt for hver side. Komponenter leser via useAppUpdate().
interface UpdateState {
  ready: boolean
  applying: boolean
}

let state: UpdateState = { ready: false, applying: false }
const initialState: UpdateState = state
const listeners = new Set<() => void>()

function setState(next: Partial<UpdateState>) {
  state = { ...state, ...next }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readAppliedFlag() {
  try {
    if (sessionStorage.getItem(APPLIED_FLAG) === null) return false
    sessionStorage.removeItem(APPLIED_FLAG)
    return true
  } catch {
    // Privat modus og blokkerte informasjonskapsler kaster - da mister vi
    // kun bekreftelsen, ikke oppdateringen.
    return false
  }
}

let reloading = false

function reloadOnce() {
  if (reloading) return
  reloading = true
  try {
    sessionStorage.setItem(APPLIED_FLAG, '1')
  } catch {
    // Se readAppliedFlag().
  }
  window.location.reload()
}

// Vi styrer denne selv i stedet for å bruke updateSW() fra vite-plugin-pwa.
// Plugin-en laster kun siden på nytt når den selv ser en «controlling»-
// hendelse den har merket som oppdatering, og har den ventende workeren
// forsvunnet - for eksempel fordi en annen fane alt har tatt versjonen i
// bruk - skjer det ingenting i det hele tatt når man trykker. Her reloader
// vi uansett: enten når den nye workeren tar over, eller på tidsavbrudd.
async function applyUpdate() {
  if (state.applying) return
  setState({ applying: true })

  if (!('serviceWorker' in navigator)) {
    reloadOnce()
    return
  }

  navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { once: true })

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  } catch {
    // Reloaden under fanger opp dette.
  }

  window.setTimeout(reloadOnce, CONTROLLER_TIMEOUT_MS)
}

export function useAppUpdate() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => initialState)
  return { ...snapshot, apply: applyUpdate }
}

// Leses én gang per sidelast, før React monterer, slik at bekreftelsen etter
// reloaden ikke avhenger av hvilken komponent som spør først.
export const justUpdated = typeof window === 'undefined' ? false : readAppliedFlag()

export function registerAppUpdate() {
  registerSW({
    // Ny versjon ligger ferdig nedlastet og venter. Ingen toast, ingen
    // automatisk reload - en stille knapp i headeren lar brukeren ta den i
    // bruk når det passer, så ingen mister plassen sin midt i lesing.
    onNeedRefresh() {
      setState({ ready: true })
    },
    onRegisteredSW(swUrl, registration) {
      if (!registration) return
      setInterval(async () => {
        if (registration.installing || !navigator.onLine) return
        const resp = await fetch(swUrl, {
          cache: 'no-store',
          headers: { cache: 'no-store', 'cache-control': 'no-cache' },
        })
        if (resp.status === 200) await registration.update()
      }, CHECK_INTERVAL_MS)

      // Samme sjekk som over, men kjørt av service workeren selv mens appen
      // er helt lukket - se periodicsync-lytteren i src/sw.ts.
      void registerPeriodicContentRefresh(registration)
    },
  })
}
