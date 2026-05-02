import { useState, useMemo, use } from 'react'
import { Link } from 'react-router-dom'
import { hentArtikler } from '../data/loader'
import { ChevronRightIcon, SearchIcon, CloseIcon } from '../components/Icons'

export function SlikGjorDu() {
  const alleKategorier = use(hentArtikler())
  const [filter, setFilter] = useState('')

  const kategorier = useMemo(() => {
    if (!filter.trim()) return alleKategorier
    const q = filter.toLowerCase()
    return alleKategorier.map(kat => ({
      ...kat,
      artikler: kat.artikler.filter(
        art =>
          art.tittel.toLowerCase().includes(q) ||
          art.ingress.toLowerCase().includes(q) ||
          art.tags.some(t => t.toLowerCase().includes(q))
      ),
    })).filter(kat => kat.artikler.length > 0)
  }, [filter, alleKategorier])

  const totalArtikler = alleKategorier.reduce((sum, k) => sum + k.artikler.length, 0)

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Intro */}
      <div className="bg-brand-700 text-white px-4 pt-6 pb-8">
        <p className="text-brand-100 text-sm leading-relaxed text-center">
          Steg-for-steg-veiledninger for Microsoft 365
        </p>
      </div>

      <div className="bg-brand-700 h-5 relative">
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-slate-50 rounded-t-[1.5rem]" />
      </div>

      <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Søk */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter veiledning..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            aria-label="Søk i veiledninger"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Tøm søk"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {kategorier.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base mb-1">Ingen veiledninger funnet</p>
            <button
              onClick={() => setFilter('')}
              className="text-sm text-brand-700 hover:text-brand-800 underline"
            >
              Vis alle veiledninger
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {kategorier.map(kat => (
              <section key={kat.id} aria-labelledby={`kat-${kat.id}`}>
                <div className="mb-2 px-1">
                  <h2 id={`kat-${kat.id}`} className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {kat.tittel}
                  </h2>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {kat.artikler.map((art, idx) => (
                    <Link
                      key={art.id}
                      to={`/slik-gjor-du/${kat.id}/${art.id}`}
                      className={`flex items-center gap-3 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group ${
                        idx < kat.artikler.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-brand-700 transition-colors">
                          {art.tittel}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {art.ingress}
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

        {!filter && (
          <p className="text-xs text-slate-400 text-center mt-6">
            {totalArtikler} veiledninger fordelt på {alleKategorier.length} kategorier
          </p>
        )}
      </main>
    </div>
  )
}
