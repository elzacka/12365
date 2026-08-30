/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// Periodic Background Sync er ikke i TypeScripts DOM/webworker-lib ennå.
declare global {
  interface PeriodicSyncEvent extends ExtendableEvent {
    readonly tag: string
  }
  interface ServiceWorkerGlobalScopeEventMap {
    periodicsync: PeriodicSyncEvent
  }
}

// Skrevet for hånd (injectManifest) i stedet for auto-generert (generateSW)
// fordi Periodic Background Sync krever en egen event listener i selve
// service workeren - noe den auto-genererte varianten ikke kan romme.

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// Videoer og videominiatyrer precaches ikke (for store, hentes ved behov) -
// samme regel som globIgnores håndhevet i generateSW-varianten.
registerRoute(
  /\/videos\/thumbnails\/[^/]+\.(?:png|jpg|jpeg|webp)$/i,
  new CacheFirst({
    cacheName: 'video-thumbnails',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)
registerRoute(/\/videos\/[^/]+\.mp4$/i, new NetworkOnly())

// registerType: 'prompt' - vi kaller aldri skipWaiting()/clientsClaim()
// automatisk. Klienten ber uttrykkelig om det (se registerAppUpdate.ts),
// stille i bakgrunnen, aldri med en synlig prompt.
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// Periodic Background Sync (kun Chromium, kun installerte apper som møter
// nettleserens engasjement-terskel) - lar service workeren sjekke etter en
// ny versjon mens appen er helt lukket, slik at oppdateringen kan stå og
// vente ferdig nedlastet neste gang brukeren åpner appen.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'refresh-content') {
    event.waitUntil(self.registration.update())
  }
})
