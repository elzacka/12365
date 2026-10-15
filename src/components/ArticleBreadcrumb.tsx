import { Suspense, use } from 'react'
import { Link } from 'react-router-dom'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'

// Styled like the header title. No underline: a breadcrumb in a nav is identifiable as a link by position.
function Crumbs({ category }: { category?: string }) {
  return (
    <nav aria-label="Brødsmulesti" className="min-w-0">
      <ol className="flex items-center gap-x-1.5 text-base font-semibold text-slate-800 whitespace-nowrap">
        <li className="shrink-0">
          <Link to="/gjor-sann" className="text-slate-500 hover:text-brand-700 transition-colors">
            Gjør sånn
          </Link>
        </li>
        {category && (
          <li className="flex items-center gap-1.5 min-w-0">
            <span aria-hidden="true" className="text-slate-400">›</span>
            <span className="truncate">{category}</span>
          </li>
        )}
      </ol>
    </nav>
  )
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
