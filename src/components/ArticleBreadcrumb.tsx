import { Suspense, use } from 'react'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'
import { Breadcrumb } from './Breadcrumb'

function Crumbs({ category }: { category?: string }) {
  return <Breadcrumb parentTo="/gjor-sann" parentLabel="Gjør sånn" current={category} />
}

function CategoryCrumbs({ kategoriId }: { kategoriId: string }) {
  const categories = useMergedArticles(use(fetchArticles()))
  return <Crumbs category={categories.find(k => k.id === kategoriId)?.tittel} />
}

export function ArticleBreadcrumb({ kategoriId }: { kategoriId: string }) {
  return (
    <Suspense fallback={<Crumbs />}>
      <CategoryCrumbs kategoriId={kategoriId} />
    </Suspense>
  )
}
