import { registerSW } from 'virtual:pwa-register'
import { isStandalone } from '../hooks/useInstallPrompt'

// Periodic Background Sync er ikke i TypeScripts DOM-lib ennå.
interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>
}
interface ServiceWorkerRegistrationWithPeriodicSync extends ServiceWorkerRegistration {
  readonly periodicSync: PeriodicSyncManager
}

// Kun installerte (standalone) brukere kan sitte fast på en gammel, cachet
// versjon over tid - vanlige nettleserbesøk sjekker service workeren på hver
// navigasjon og får ferskt innhold av seg selv.
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

export function registerAppUpdate() {
  if (!isStandalone()) return

  const updateSW = registerSW({
    onNeedRefresh() {
      // Ingen synlig prompt - oppdateringen tas i bruk stille når fanen
      // uansett ikke vises (appbytte, bakgrunn, lukking), så brukeren aldri
      // ser en reload midt i lesing.
      const applyWhenHidden = () => {
        void updateSW()
      }
      if (document.hidden) {
        applyWhenHidden()
        return
      }
      const onVisibilityChange = () => {
        if (!document.hidden) return
        document.removeEventListener('visibilitychange', onVisibilityChange)
        applyWhenHidden()
      }
      document.addEventListener('visibilitychange', onVisibilityChange)
    },
    onRegisteredSW(swUrl, registration) {
      if (!registration) return
      // Fanger opp nye versjoner selv i lange, sammenhengende økter der
      // brukeren aldri navigerer og dermed aldri utløser nettleserens egen
      // service worker-sjekk.
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
