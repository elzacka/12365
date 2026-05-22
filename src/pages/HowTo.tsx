import { useState, useMemo, use } from 'react'
import { Link } from 'react-router-dom'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'
import { ChevronRightIcon, SearchIcon, CloseIcon } from '../components/Icons'

export function HowTo() {
  const publicCategories = use(fetchArticles())
  const rawCategories = useMergedArticles(publicCategories)
  const [query, setQuery] = useState('')

  // Filter out hidden articles early — applies to listing and search count alike.
  const allCategories = useMemo(
    () =>
      rawCategories
        .map(cat => ({ ...cat, artikler: cat.artikler.filter(a => !a.skjult) }))
        .filter(cat => cat.artikler.length > 0),
    [rawCategories],
  )

  const categories = useMemo(() => {
    if (!query.trim()) return allCategories
    const q = query.toLowerCase()
    return allCategories.map(cat => ({
      ...cat,
      artikler: cat.artikler.filter(
        article =>
          article.tittel.toLowerCase().includes(q) ||
          article.ingress.toLowerCase().includes(q) ||
          article.tags.some(t => t.toLowerCase().includes(q))
      ),
    })).filter(cat => cat.artikler.length > 0)
  }, [query, allCategories])

  const totalArticles = allCategories.reduce((sum, k) => sum + k.artikler.length, 0)

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter veiledning..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            aria-label="Søk i veiledninger"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Tøm søk"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-base mb-1">Ingen veiledninger funnet</p>
            <button
              onClick={() => setQuery('')}
              className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
            >
              Vis alle veiledninger
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {categories.map(cat => (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                <div className="mb-2 px-1">
                  <h2 id={`cat-${cat.id}`} className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {cat.tittel}
                  </h2>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {cat.artikler.map((article, idx) => (
                    <Link
                      key={article.id}
                      to={`/slik-gjor-du/${cat.id}/${article.id}`}
                      className={`flex items-center gap-3 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group ${
                        idx < cat.artikler.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-brand-700 transition-colors">
                          {article.tittel}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {article.ingress}
                        </p>
                      </div>
                      <ChevronRightIcon size={18} className="text-slate-300 flex-shrink-0 group-hover:text-brand-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!query && (
          <p className="text-xs text-slate-500 text-center mt-6">
            {totalArticles} veiledninger fordelt på {allCategories.length} kategorier
          </p>
        )}
      </main>
    </div>
  )
}
