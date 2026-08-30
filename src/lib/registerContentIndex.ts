import { fetchArticles } from '../data/loader'

// Content Index API - eksperimentell, kun Chromium. Ikke typet i TypeScripts
// DOM-lib, så vi definerer det minimale grensesnittet selv.
interface ContentIndexIcon {
  src: string
  sizes?: string
  type?: string
}

interface ContentDescription {
  id: string
  title: string
  description: string
  category?: 'homepage' | 'article' | 'video' | 'audio' | 'other'
  icons?: ContentIndexIcon[]
  url: string
}

interface ContentIndex {
  add(content: ContentDescription): Promise<void>
  delete(id: string): Promise<void>
  getAll(): Promise<ContentDescription[]>
}

interface ServiceWorkerRegistrationWithContentIndex extends ServiceWorkerRegistration {
  readonly index: ContentIndex
}

// Gjør offline-tilgjengelige artikler synlige i nettleserens eget
// "offline innhold"-oversikt (i dag kun Android Chrome). Alle artiklene er
// allerede precachet av service workeren - dette gjør dem finnbare der også.
// Skjulte og låste artikler holdes utenfor, samme regel som andre lister.
export async function registerContentIndex() {
  if (!('serviceWorker' in navigator)) return
  const registration = (await navigator.serviceWorker.ready) as ServiceWorkerRegistrationWithContentIndex
  if (!('index' in registration)) return

  const base = import.meta.env.BASE_URL
  const categories = await fetchArticles()
  const items: ContentDescription[] = categories.flatMap(cat =>
    cat.artikler
      .filter(a => !a.skjult && !a.laast)
      .map(a => ({
        id: a.id,
        title: a.tittel,
        description: a.ingress,
        category: 'article',
        icons: [{ src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' }],
        url: `${base}slik-gjor-du/${cat.id}/${a.id}`,
      })),
  )

  const currentIds = new Set(items.map(i => i.id))
  const existing = await registration.index.getAll()
  for (const entry of existing) {
    if (!currentIds.has(entry.id)) await registration.index.delete(entry.id)
  }
  for (const item of items) {
    await registration.index.add(item)
  }
}
