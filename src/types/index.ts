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
