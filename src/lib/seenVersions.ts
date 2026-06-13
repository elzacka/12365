// Tracks which content the user has acknowledged. The content versions are
// produced by scripts/generate-versions.mjs and shipped as
// /content/versions.json. We compare what the user has seen (in localStorage)
// against the current build to decide where to show "ny eller endret"-prikker.

export interface Versions {
  generated: string
  cards: Record<string, string>
  articles: Record<string, string>
  videos: Record<string, string>
  courses: Record<string, string>
  ordbok: Record<string, string>
  license: string
  about: string
  // Items keyed here had a manual "endret"-date set by the author. Those
  // items are NOT seeded into localStorage on a first visit so the prikk
  // stays visible until the reader interacts with them.
  endret?: {
    cards?: Record<string, string>
    articles?: Record<string, string>
    videos?: Record<string, string>
    courses?: Record<string, string>
    ordbok?: Record<string, string>
    license?: string
    about?: string
  }
}

export interface SeenVersions {
  cards: Record<string, string>
  articles: Record<string, string>
  videos: Record<string, string>
  courses: Record<string, string>
  ordbok: Record<string, string>
  license: string
  about: string
}

export const SEEN_STORAGE_KEY = '12365:seenVersions'

export function emptySeen(): SeenVersions {
  return { cards: {}, articles: {}, videos: {}, courses: {}, ordbok: {}, license: '', about: '' }
}

export function readSeen(): SeenVersions | null {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SeenVersions>
    return {
      cards: parsed.cards ?? {},
      articles: parsed.articles ?? {},
      videos: parsed.videos ?? {},
      courses: parsed.courses ?? {},
      ordbok: parsed.ordbok ?? {},
      license: parsed.license ?? '',
      about: parsed.about ?? '',
    }
  } catch {
    return null
  }
}

export function writeSeen(seen: SeenVersions): void {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(seen))
  } catch {
    // localStorage may be unavailable (private mode, quota). Silent fail
    // is acceptable — worst case the dot keeps showing.
  }
}

// First-time visit: prime localStorage with the current versions so the new
// user doesn't see prikker everywhere. Items flagged with endret-date are
// skipped, so the prikk stays visible until the reader interacts.
export function seedFromVersions(versions: Versions): SeenVersions {
  const endret = versions.endret ?? {}
  const seedSection = (
    all: Record<string, string>,
    flagged: Record<string, string> | undefined,
  ): Record<string, string> => {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(all)) {
      if (!flagged?.[k]) out[k] = v
    }
    return out
  }
  return {
    cards: seedSection(versions.cards, endret.cards),
    articles: seedSection(versions.articles, endret.articles),
    videos: seedSection(versions.videos, endret.videos),
    courses: seedSection(versions.courses, endret.courses),
    ordbok: seedSection(versions.ordbok ?? {}, endret.ordbok),
    license: endret.license ? '' : versions.license,
    about: endret.about ? '' : versions.about,
  }
}

// Existing localStorage from an older build may lack fields (e.g. when this
// feature gains a new section). Treat anything the user wasn't previously
// tracking as "already seen", unless it's flagged endret. Without this,
// returning visitors would get false prikker on Om appen / Videoer / etc the
// first time after we upgrade them.
export function backfillSeen(existing: SeenVersions, versions: Versions): SeenVersions {
  const endret = versions.endret ?? {}
  const backfillSection = (
    seen: Record<string, string>,
    all: Record<string, string>,
    flagged: Record<string, string> | undefined,
  ): Record<string, string> => {
    const out = { ...seen }
    for (const [k, v] of Object.entries(all)) {
      if (!(k in out) && !flagged?.[k]) out[k] = v
    }
    return out
  }
  return {
    cards: backfillSection(existing.cards, versions.cards, endret.cards),
    articles: backfillSection(existing.articles, versions.articles, endret.articles),
    videos: backfillSection(existing.videos, versions.videos, endret.videos),
    courses: backfillSection(existing.courses, versions.courses ?? {}, endret.courses),
    ordbok: backfillSection(existing.ordbok, versions.ordbok ?? {}, endret.ordbok),
    license: existing.license || (endret.license ? '' : versions.license),
    about: existing.about || (endret.about ? '' : versions.about),
  }
}
