import { Suspense, use } from 'react'
import { Link } from 'react-router-dom'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'

// Link differs from the category by colour (>3:1); no underline by design.
function Crumbs({ category }: { category?: string }) {
  return (
    <nav aria-label="Brødsmulesti" className="min-w-0">
      <ol className="flex items-center gap-x-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 whitespace-nowrap">
        <li className="shrink-0">
          <Link to="/slik-gjor-du" className="inline-block py-1 text-brand-700 hover:text-brand-400 transition-colors">
            Gjør sånn
          </Link>
        </li>
        {category && (
          <li className="flex items-center gap-1.5 min-w-0">
            <span aria-hidden="true">›</span>
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
