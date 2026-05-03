import type { ArticleCategory, FlipCard, Video } from '../types'

const base = import.meta.env.BASE_URL

async function fetchJson<T>(filnavn: string): Promise<T> {
  const res = await fetch(`${base}content/${filnavn}`)
  if (!res.ok) {
    throw new Error(`Klarte ikke å laste ${filnavn} (${res.status})`)
  }
  return (await res.json()) as T
}

let artiklerPromise: Promise<ArticleCategory[]> | null = null
let kortPromise: Promise<FlipCard[]> | null = null
let videoerPromise: Promise<Video[]> | null = null

export function hentArtikler(): Promise<ArticleCategory[]> {
  artiklerPromise ??= fetchJson<ArticleCategory[]>('articles.json')
  return artiklerPromise
}

export function hentKort(): Promise<FlipCard[]> {
  kortPromise ??= fetchJson<FlipCard[]>('cards.json')
  return kortPromise
}

export function hentVideoer(): Promise<Video[]> {
  videoerPromise ??= fetchJson<Video[]>('videos.json')
  return videoerPromise
}
