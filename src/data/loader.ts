import type { ArticleCategory, Course, FlipCard, KiVurdering, LicenseOverview, Oppslag, Video } from '../types'

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
let coursesPromise: Promise<Course[]> | null = null
let licenseOverviewPromise: Promise<LicenseOverview> | null = null
let jukselappPromise: Promise<Oppslag[]> | null = null
let hurtigtasterPromise: Promise<Oppslag[]> | null = null
let kiVurderingPromise: Promise<KiVurdering> | null = null

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

export function fetchCourses(): Promise<Course[]> {
  coursesPromise ??= fetchJson<Course[]>('courses.json')
  return coursesPromise
}

export function fetchLicenseOverview(): Promise<LicenseOverview> {
  licenseOverviewPromise ??= fetchJson<LicenseOverview>('license-overview.json')
  return licenseOverviewPromise
}

export function fetchJukselapp(): Promise<Oppslag[]> {
  jukselappPromise ??= fetchJson<Oppslag[]>('jukselapp.json')
  return jukselappPromise
}

export function fetchHurtigtaster(): Promise<Oppslag[]> {
  hurtigtasterPromise ??= fetchJson<Oppslag[]>('hurtigtaster.json')
  return hurtigtasterPromise
}

export function fetchKiVurdering(): Promise<KiVurdering> {
  kiVurderingPromise ??= fetchJson<KiVurdering>('ki-vurdering.json')
  return kiVurderingPromise
}
