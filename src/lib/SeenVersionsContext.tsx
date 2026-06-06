import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SeenVersions, Versions } from './seenVersions'
import { backfillSeen, emptySeen, readSeen, seedFromVersions, writeSeen } from './seenVersions'

interface SeenVersionsContextValue {
  ready: boolean
  isCardNew: (navn: string) => boolean
  isArticleNew: (id: string) => boolean
  isVideoNew: (id: string) => boolean
  isLicenseNew: () => boolean
  isAboutNew: () => boolean
  hasNewCards: boolean
  hasNewArticles: boolean
  hasNewVideos: boolean
  hasNewLicense: boolean
  hasNewAbout: boolean
  markCardSeen: (navn: string) => void
  markAllCardsSeen: () => void
  markArticleSeen: (id: string) => void
  markVideoSeen: (id: string) => void
  markAllVideosSeen: () => void
  markLicenseSeen: () => void
  markAboutSeen: () => void
}

const SeenVersionsContext = createContext<SeenVersionsContextValue | null>(null)

export function SeenVersionsProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<Versions | null>(null)
  const [seen, setSeen] = useState<SeenVersions>(emptySeen)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL
    fetch(`${base}content/versions.json`)
      .then(r => (r.ok ? r.json() : null))
      .then((v: Versions | null) => {
        if (cancelled || !v) {
          setReady(true)
          return
        }
        setVersions(v)
        const existing = readSeen()
        if (existing === null) {
          const seeded = seedFromVersions(v)
          writeSeen(seeded)
          setSeen(seeded)
        } else {
          const backfilled = backfillSeen(existing, v)
          writeSeen(backfilled)
          setSeen(backfilled)
        }
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isCardNew = useCallback(
    (navn: string) => !!versions && versions.cards[navn] !== undefined && seen.cards[navn] !== versions.cards[navn],
    [versions, seen],
  )
  const isArticleNew = useCallback(
    (id: string) => !!versions && versions.articles[id] !== undefined && seen.articles[id] !== versions.articles[id],
    [versions, seen],
  )
  const isVideoNew = useCallback(
    (id: string) => !!versions && versions.videos[id] !== undefined && seen.videos[id] !== versions.videos[id],
    [versions, seen],
  )
  const isLicenseNew = useCallback(
    () => !!versions && seen.license !== versions.license,
    [versions, seen],
  )
  const isAboutNew = useCallback(
    () => !!versions && seen.about !== versions.about,
    [versions, seen],
  )

  const hasNewCards = useMemo(() => {
    if (!versions) return false
    return Object.keys(versions.cards).some(k => seen.cards[k] !== versions.cards[k])
  }, [versions, seen])
  const hasNewArticles = useMemo(() => {
    if (!versions) return false
    return Object.keys(versions.articles).some(k => seen.articles[k] !== versions.articles[k])
  }, [versions, seen])
  const hasNewVideos = useMemo(() => {
    if (!versions) return false
    return Object.keys(versions.videos).some(k => seen.videos[k] !== versions.videos[k])
  }, [versions, seen])
  const hasNewLicense = useMemo(() => {
    return !!versions && seen.license !== versions.license
  }, [versions, seen])
  const hasNewAbout = useMemo(() => {
    return !!versions && seen.about !== versions.about
  }, [versions, seen])

  const persist = useCallback((next: SeenVersions) => {
    writeSeen(next)
    setSeen(next)
  }, [])

  const markCardSeen = useCallback(
    (navn: string) => {
      if (!versions) return
      const cur = versions.cards[navn]
      if (!cur || seen.cards[navn] === cur) return
      persist({ ...seen, cards: { ...seen.cards, [navn]: cur } })
    },
    [versions, seen, persist],
  )
  const markArticleSeen = useCallback(
    (id: string) => {
      if (!versions) return
      const cur = versions.articles[id]
      if (!cur || seen.articles[id] === cur) return
      persist({ ...seen, articles: { ...seen.articles, [id]: cur } })
    },
    [versions, seen, persist],
  )
  const markVideoSeen = useCallback(
    (id: string) => {
      if (!versions) return
      const cur = versions.videos[id]
      if (!cur || seen.videos[id] === cur) return
      persist({ ...seen, videos: { ...seen.videos, [id]: cur } })
    },
    [versions, seen, persist],
  )
  const markLicenseSeen = useCallback(() => {
    if (!versions || seen.license === versions.license) return
    persist({ ...seen, license: versions.license })
  }, [versions, seen, persist])
  const markAboutSeen = useCallback(() => {
    if (!versions || seen.about === versions.about) return
    persist({ ...seen, about: versions.about })
  }, [versions, seen, persist])

  const markAllCardsSeen = useCallback(() => {
    if (!versions) return
    let changed = false
    const next = { ...seen.cards }
    for (const [k, v] of Object.entries(versions.cards)) {
      if (next[k] !== v) {
        next[k] = v
        changed = true
      }
    }
    if (changed) persist({ ...seen, cards: next })
  }, [versions, seen, persist])
  const markAllVideosSeen = useCallback(() => {
    if (!versions) return
    let changed = false
    const next = { ...seen.videos }
    for (const [k, v] of Object.entries(versions.videos)) {
      if (next[k] !== v) {
        next[k] = v
        changed = true
      }
    }
    if (changed) persist({ ...seen, videos: next })
  }, [versions, seen, persist])

  const value: SeenVersionsContextValue = {
    ready,
    isCardNew,
    isArticleNew,
    isVideoNew,
    isLicenseNew,
    isAboutNew,
    hasNewCards,
    hasNewArticles,
    hasNewVideos,
    hasNewLicense,
    hasNewAbout,
    markCardSeen,
    markAllCardsSeen,
    markArticleSeen,
    markVideoSeen,
    markAllVideosSeen,
    markLicenseSeen,
    markAboutSeen,
  }

  return <SeenVersionsContext.Provider value={value}>{children}</SeenVersionsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSeenVersions(): SeenVersionsContextValue {
  const ctx = useContext(SeenVersionsContext)
  if (!ctx) throw new Error('useSeenVersions must be used inside SeenVersionsProvider')
  return ctx
}
