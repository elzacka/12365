import { registerSW } from 'virtual:pwa-register'
import { isStandalone } from '../hooks/useInstallPrompt'

// Kun installerte (standalone) brukere kan sitte fast på en gammel, cachet
// versjon over tid - vanlige nettleserbesøk sjekker service workeren på hver
// navigasjon og får ferskt innhold av seg selv.
const CHECK_INTERVAL_MS = 60 * 60 * 1000

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
    },
  })
}
