export interface FlipCard {
  navn: string
  tagline: string
  alene: string
  sammen: string
  fotnote: string
}

export interface ArticleStep {
  tittel: string
  innhold: string // markdown-støttet tekst
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
