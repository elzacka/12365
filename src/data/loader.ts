import type { ArticleCategory, FlipCard, LicenseComparison, Video } from '../types'

const base = import.meta.env.BASE_URL

async function fetchJson<T>(filename: string): Promise<T> {
  const res = await fetch(`${base}content/${filename}`)
  if (!res.ok) {
    throw new Error(`Klarte ikke å laste ${filename} (${res.status})`)
  }
  return (await res.json()) as T
}

let articlesPromise: Promise<ArticleCategory[]> | null = null
let cardsPromise: Promise<FlipCard[]> | null = null
let videosPromise: Promise<Video[]> | null = null
let licensesPromise: Promise<LicenseComparison> | null = null

export function fetchArticles(): Promise<ArticleCategory[]> {
  articlesPromise ??= fetchJson<ArticleCategory[]>('articles.json')
  return articlesPromise
}

export function fetchCards(): Promise<FlipCard[]> {
  cardsPromise ??= fetchJson<FlipCard[]>('cards.json')
  return cardsPromise
}

export function fetchVideos(): Promise<Video[]> {
  videosPromise ??= fetchJson<Video[]>('videos.json')
  return videosPromise
}

export function fetchLicenseComparison(): Promise<LicenseComparison> {
  licensesPromise ??= fetchJson<LicenseComparison>('license-comparison.json')
  return licensesPromise
}
