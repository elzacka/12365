import { useMemo } from 'react'
import type { ArticleCategory, FlipCard, Video } from '../types'
import { useAuth } from './AuthContext'

export function useMergedCards(publicCards: FlipCard[]): FlipCard[] {
  const { locked } = useAuth()
  return useMemo(() => {
    if (!locked?.cards?.length) return publicCards
    return [...publicCards, ...locked.cards]
  }, [publicCards, locked])
}

export function useMergedVideos(publicVideos: Video[]): Video[] {
  const { locked } = useAuth()
  return useMemo(() => {
    if (!locked?.videos?.length) return publicVideos
    return [...publicVideos, ...locked.videos]
  }, [publicVideos, locked])
}

// Categories from the locked payload are merged by `id`. Locked articles in an
// existing public category are appended after the public ones. Locked
// categories that don't exist publicly are appended at the end.
export function useMergedArticles(publicCategories: ArticleCategory[]): ArticleCategory[] {
  const { locked } = useAuth()
  return useMemo(() => {
    if (!locked?.articles?.length) return publicCategories
    const result = publicCategories.map(c => ({ ...c, artikler: [...c.artikler] }))
    for (const lockedCat of locked.articles) {
      const existing = result.find(c => c.id === lockedCat.id)
      if (existing) {
        existing.artikler.push(...lockedCat.artikler)
      } else {
        result.push({ ...lockedCat, artikler: [...lockedCat.artikler] })
      }
    }
    return result
  }, [publicCategories, locked])
}
