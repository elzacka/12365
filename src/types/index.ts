// Field names mirror the JSON content and stay Norwegian, so content authors
// see the same vocabulary in code and data.

export interface FlipCard {
  navn: string
  tagline: string
  alene: string
  sammen: string
  fotnote?: string
  kategori: string          // id matching an AppCategory
  oppsummering: string      // short one-line use case in Sammenligne
  overlapper?: string[]     // navn of apps with notable functional overlap
  lenke?: {
    tekst: string
    url: string
  }
  laast?: boolean // marks the card as gated content; only added to listings when the user has unlocked
}

export interface AppCategory {
  id: string
  navn: string
  beskrivelse?: string
  fargeBakgrunn: string  // Tailwind utility class, e.g. 'bg-sky-50'
}

export interface ArticleImage {
  src: string         // path relative to BASE_URL, e.g. "articles/viva-learning-sharepoint/01-dataflow.png"
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
  notat?: string // optional italic note shown under the lede – license or prerequisite warnings
  kategori: string
  tags: string[]
  alias?: string[] // search-only alternate/English terms, never displayed
  steg: ArticleStep[]
  videoUrl?: string
  relaterte?: string[] // article ids
  skjult?: boolean // if true: filtered out of listings; direct URL redirects to overview
  laast?: boolean // marks the article as gated content; only added to listings when the user has unlocked
  _veiledning?: string // internal comment in articles.json – not rendered anywhere
}

export interface ArticleCategory {
  id: string
  tittel: string
  beskrivelse: string
  kollapset?: boolean // if true: the overview shows only the heading until the user expands it
  artikler: Article[]
}

// Shared text body for video and course tiles. All four fields are required so
// JSON files keep stable placeholders; the renderer hides each field when its
// value is the empty string.
export interface SeOgHorBody {
  tittel: string      // heading
  beskrivelse: string // one or two sentences under the heading
  kilde: string       // provider or origin, e.g. "Digital Norway"
  fotnote: string     // smaller italic note shown last
}

export interface Video extends SeOgHorBody {
  id: string          // unique kebab-case id, appears in the URL
  fil: string         // path relative to BASE_URL, e.g. "videos/min-video.mp4"
  thumbnail?: string  // optional thumbnail path, e.g. "videos/thumbnails/min-video.png"
  laast?: boolean     // marks the video as gated content; only added to listings when the user has unlocked
}

export interface Course extends SeOgHorBody {
  id: string          // unique kebab-case id
  lenke: string       // external URL the user is sent to on click
  thumbnail?: string  // optional thumbnail path under public/, e.g. "courses/thumbnails/datareisen.png"
  laast?: boolean     // marks the course as gated content; only added to listings when the user has unlocked
}

export interface KiVurderingKort {
  id: string          // unique kebab-case id
  tittel: string      // front, with the card number
  farge: 'rod' | 'oransje' | 'gul' | 'gronn' // stripe on both faces; number and title carry the meaning too
  sporsmal: string    // front, the question the card asks
  oppsummering: string // front, one line under the question
  etikett?: string    // front, title of the eksempler box; default «Eksempler»
  eksempler: string[] // front
  svar: string        // back, what to do
  punkter: string[]   // back
  kilde: string       // back, legal basis
}

export interface KiVurdering {
  bokser: { id: string; tittel: string; tekst: string }[] // expand boxes; tekst is markdown as in src/lib/markdown.tsx
  veiledning: string  // one line above the cards
  kort: KiVurderingKort[]
  merknad: string     // muted line under the cards
}

// Shape of the decrypted locked payload. Mirrors the public content arrays so
// merging into the listings is a simple per-category concatenation.
export interface LockedContent {
  cards?: FlipCard[]
  articles?: ArticleCategory[]
  videos?: Video[]
  courses?: Course[]
  hurtigtaster?: Oppslag[]
  hurtigtasterGrupper?: OppslagGroup[]
}

export type LicenseStatus = 'inkludert' | 'tillegg'

export type LicenseId = 'e5' | 'e7'

export interface LicenseFeature {
  navn: string
  status: Record<LicenseId, LicenseStatus>
  beskrivelse: string
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

export interface LicenseOverview {
  kilde: string
  kildeUrl: string
  tema: LicenseTheme[]
  kategorier: LicenseCategory[]
}

/** A section in a grouped Oppslag list: entries whose first tag is `tag`. */
export interface OppslagGroup {
  tag: string
  title: string
  /** Subheadings, in this order; entries carry theirs in `undergruppe`. */
  undergrupper?: string[]
}

// `tittel` is the full form, an acronym goes in `undertittel`. `alias` makes
// an entry findable by other names without a row of its own.
export interface Oppslag {
  id: string
  tittel: string
  undertittel?: string
  forklaring: string
  tags: string[]
  alias?: string[]
  undergruppe?: string
}
