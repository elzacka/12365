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
  // Cheat-sheet metadata. Optional so locked content from older payloads
  // remains assignable; cards without kategori land in an "Annet" group.
  kategori?: string         // id matching a CheatSheetCategory
  oppsummering?: string     // short one-line use case for the cheat sheet
  overlapper?: string[]     // navn of apps with notable functional overlap
  lenke?: {
    tekst: string
    url: string
  }
  laast?: boolean // marks the card as gated content; only added to listings when the user has unlocked
  'skjul-endret'?: boolean // if true: editorial change suppresses the "ny eller endret"-dot
  endret?: string // ISO date YYYY-MM-DD. First-time visitors see a prikk on this item until they interact with it
}

export interface CheatSheetCategory {
  id: string
  navn: string
  beskrivelse: string
  fargeBakgrunn: string  // Tailwind utility class, e.g. 'bg-sky-50'
  fargeAksent: string    // Tailwind utility class for accent ring/text
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
  oppdatert?: string // optional "oppdatert" date shown as small italic line under the lede
  notat?: string // optional italic note shown under the lede – license or prerequisite warnings
  kategori: string
  tags: string[]
  steg: ArticleStep[]
  videoUrl?: string
  relaterte?: string[] // article ids
  skjult?: boolean // if true: filtered out of listings; direct URL redirects to overview
  laast?: boolean // marks the article as gated content; only added to listings when the user has unlocked
  'skjul-endret'?: boolean // if true: editorial change suppresses the "ny eller endret"-dot
  endret?: string // ISO date YYYY-MM-DD. First-time visitors see a prikk on this item until they interact with it
  _veiledning?: string // internal comment in articles.json – not rendered anywhere
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
  laast?: boolean     // marks the video as gated content; only added to listings when the user has unlocked
  'skjul-endret'?: boolean // if true: editorial change suppresses the "ny eller endret"-dot
  endret?: string // ISO date YYYY-MM-DD. First-time visitors see a prikk on this item until they interact with it
}

export interface Course {
  id: string          // unique kebab-case id
  tittel: string      // displayed heading
  beskrivelse: string // one or two sentences shown under the heading
  kilde: string       // course provider, e.g. "Digital Norway"
  lenke: string       // external URL the user is sent to on click
  thumbnail?: string  // optional thumbnail path under public/, e.g. "courses/thumbnails/datareisen.png"
  laast?: boolean     // marks the course as gated content; only added to listings when the user has unlocked
  'skjul-endret'?: boolean // if true: editorial change suppresses the "ny eller endret"-dot
  endret?: string // ISO date YYYY-MM-DD. First-time visitors see a prikk on this item until they interact with it
}

// Shape of the decrypted locked payload. Mirrors the public content arrays so
// merging into the listings is a simple per-category concatenation.
export interface LockedContent {
  cards?: FlipCard[]
  articles?: ArticleCategory[]
  videos?: Video[]
  courses?: Course[]
}

export type LicenseStatus = 'inkludert' | 'tillegg'

export interface LicenseFeature {
  navn: string
  status: LicenseStatus
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

export interface E5LicenseOverview {
  kilde: string
  kildeUrl: string
  tema: LicenseTheme[]
  kategorier: LicenseCategory[]
}
