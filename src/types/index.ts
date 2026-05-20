// Type interfaces. Field names mirror the JSON content shape and intentionally
// stay in Norwegian so content authors editing the JSON files see the same
// vocabulary in code and data. Interface/type names and code identifiers are
// in English per the global English-only code rule.

export interface FlipCard {
  navn: string
  tagline: string
  alene: string
  sammen: string
  fotnote: string
  lenke?: {
    tekst: string
    url: string
  }
}

export interface ArticleImage {
  src: string         // path relative to BASE_URL, e.g. "articles/sharepoint-automasjon/01.png"
  alt: string         // screen-reader description
  bildetekst: string  // caption explaining what the image shows
  kreditering: string // source / credit line
}

export interface ArticleStep {
  tittel: string
  innhold: string // markdown-supported text
  bilde?: ArticleImage
}

export interface Article {
  id: string
  tittel: string
  ingress: string
  oppdatert?: string // optional "sist oppdatert" date shown as small italic line under the lede
  notat?: string // optional italic note shown under the lede — license or prerequisite warnings
  kategori: string
  tags: string[]
  steg: ArticleStep[]
  videoUrl?: string
  relaterte?: string[] // article ids
  skjult?: boolean // if true: filtered out of listings; direct URL redirects to overview
  _veiledning?: string // internal comment in articles.json — not rendered anywhere
}

export interface ArticleCategory {
  id: string
  tittel: string
  beskrivelse: string
  artikler: Article[]
}

export interface Video {
  id: string          // unique kebab-case id, appears in the URL
  fil: string         // path relative to BASE_URL, e.g. "videos/min-video.mp4"
  tittel?: string     // optional title
  intro?: string      // optional short intro text
  thumbnail?: string  // optional thumbnail path, e.g. "videos/thumbnails/min-video.png"
}

export type LicenseStatus = 'inkludert' | 'tillegg' | 'ikke'

export interface LicenseFeature {
  navn: string
  e3: LicenseStatus
  e5: LicenseStatus
  beskrivelse?: string
}

export interface LicenseCategory {
  id: string
  navn: string
  tema: string
  funksjoner: LicenseFeature[]
}

export interface LicenseTheme {
  id: string
  navn: string
  beskrivelse: string
}

export interface LicenseComparison {
  kilde: string
  kildeUrl: string
  tema: LicenseTheme[]
  kategorier: LicenseCategory[]
}
