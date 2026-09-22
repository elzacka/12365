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
let needRefresh = false
let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | undefined
const listeners = new Set<() => void>()

function setNeedRefresh(value: boolean) {
  needRefresh = value
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppUpdate() {
  const ready = useSyncExternalStore(subscribe, () => needRefresh, () => false)
  return { ready, apply: () => void applyUpdate?.(true) }
}

export function registerAppUpdate() {
  applyUpdate = registerSW({
    // Ny versjon ligger ferdig nedlastet og venter. Ingen toast, ingen
    // automatisk reload - en stille knapp i headeren lar brukeren ta den i
    // bruk når det passer, så ingen mister plassen sin midt i lesing.
    onNeedRefresh() {
      setNeedRefresh(true)
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
