export interface FlipCard {
  navn: string
  tagline: string
  alene: string
  sammen: string
  fotnote: string
}

export interface ArticleImage {
  src: string         // sti relativt til BASE_URL, f.eks. "articles/sharepoint-automasjon/01.png"
  alt: string         // beskrivelse for skjermlesere
  bildetekst: string  // forklaring av hva bildet viser
  kreditering: string // kilde/opphavsperson
}

export interface ArticleStep {
  tittel: string
  innhold: string // markdown-støttet tekst
  bilde?: ArticleImage
}

export interface Article {
  id: string
  tittel: string
  ingress: string
  kategori: string
  tags: string[]
  steg: ArticleStep[]
  videoUrl?: string
  relaterte?: string[] // article ids
}

export interface ArticleCategory {
  id: string
  tittel: string
  beskrivelse: string
  artikler: Article[]
}

export interface Video {
  id: string          // unik kebab-case-id, kommer i URL
  fil: string         // sti relativt til BASE_URL, f.eks. "videos/min-video.mp4"
  tittel?: string     // valgfri tittel
  intro?: string      // valgfri kort introtekst
  thumbnail?: string  // valgfri sti til miniatyrbilde, f.eks. "videos/thumbnails/min-video.png"
}

export type LisensStatus = 'inkludert' | 'tillegg' | 'ikke'

export interface LisensFunksjon {
  navn: string
  e3: LisensStatus
  e5: LisensStatus
  beskrivelse?: string
}

export interface LisensKategori {
  id: string
  navn: string
  tema: string
  funksjoner: LisensFunksjon[]
}

export interface LisensTema {
  id: string
  navn: string
  beskrivelse: string
}

export interface LisensSammenligning {
  kilde: string
  kildeUrl: string
  tema: LisensTema[]
  kategorier: LisensKategori[]
}
