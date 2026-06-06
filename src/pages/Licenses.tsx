import { useEffect, useState, useMemo, use } from 'react'
import { fetchE5LicenseOverview } from '../data/loader'
import { useSeenVersions } from '../lib/SeenVersionsContext'
import {
  CheckIcon,
  PlusIcon,
  SearchIcon,
  CloseIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from '../components/Icons'
import type { LicenseFeature, LicenseStatus } from '../types'

type FilterId = 'alle' | 'inkludert' | 'tillegg'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'inkludert', label: 'Inkludert' },
  { id: 'tillegg', label: 'Tilleggskjøp' },
]

const STATUS_CONFIG: Record<
  LicenseStatus,
  { bg: string; text: string; ring: string; Icon: typeof CheckIcon; label: string }
> = {
  inkludert: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    Icon: CheckIcon,
    label: 'Inkludert',
  },
  tillegg: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    Icon: PlusIcon,
    label: 'Tilleggskjøp',
  },
}

function passesFilter(f: LicenseFeature, active: FilterId): boolean {
  if (active === 'alle') return true
  return f.status === active
}

function StatusBadge({ status }: { status: LicenseStatus }) {
  const k = STATUS_CONFIG[status]
  const { Icon } = k
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${k.bg} ${k.text} ring-1 ${k.ring}`}
      aria-label={k.label}
      title={k.label}
    >
      <Icon size={13} />
    </span>
  )
}

export function Licenses() {
  const data = use(fetchE5LicenseOverview())
  const [activeFilter, setActiveFilter] = useState<FilterId>('alle')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const { markLicenseSeen } = useSeenVersions()

  useEffect(() => {
    markLicenseSeen()
  }, [markLicenseSeen])

  const normalizedQuery = query.trim().toLowerCase()
  const isFiltered = activeFilter !== 'alle' || normalizedQuery.length > 0

  const filteredCategories = useMemo(() => {
    return data.kategorier
      .map(cat => ({
        ...cat,
        funksjoner: cat.funksjoner.filter(f =>
          passesFilter(f, activeFilter) &&
          (normalizedQuery ? f.navn.toLowerCase().includes(normalizedQuery) : true)
        ),
      }))
      .filter(cat => cat.funksjoner.length > 0)
  }, [data, activeFilter, normalizedQuery])

  function reset() {
    setActiveFilter('alle')
    setQuery('')
  }

  function toggleCategory(id: string) {
    if (isFiltered) return
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-10 max-w-2xl mx-auto w-full">
        {/* Guidance + source */}
        <p className="text-center text-sm text-slate-500 mb-1">
          Trykk for å se hva de ulike tingene brukes til
        </p>
        <p className="text-center text-[10px] italic mb-3">
          <a
            href={data.kildeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-brand-600 transition-colors"
          >
            Kilde: {data.kilde}
            <ExternalLinkIcon size={9} className="inline-block ml-0.5 align-[-0.125em]" />
          </a>
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter app, tjeneste, funksjon..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            aria-label="Søk i lisensfunksjoner"
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

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 hide-scrollbar -mx-4 px-4">
          {FILTERS.map(f => {
            const isActive = activeFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                aria-pressed={isActive}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Theme groups */}
        {data.tema.map(theme => {
          const categoriesInTheme = filteredCategories.filter(k => k.tema === theme.id)
          if (categoriesInTheme.length === 0) return null
          const totalInTheme = categoriesInTheme.reduce((sum, k) => sum + k.funksjoner.length, 0)
          return (
            <section key={theme.id} className="mb-6" aria-labelledby={`tema-${theme.id}`}>
              <header className="mb-2 px-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    id={`tema-${theme.id}`}
                    className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {theme.navn}
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 tabular-nums">{totalInTheme}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{theme.beskrivelse}</p>
              </header>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {categoriesInTheme.map((cat, idx) => {
                  const isOpen = isFiltered || expanded.has(cat.id)
                  return (
                    <div key={cat.id} className={idx > 0 ? 'border-t border-slate-100' : ''}>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
                          isFiltered ? 'cursor-default' : 'hover:bg-slate-50 active:bg-slate-100'
                        }`}
                        aria-expanded={isOpen}
                        aria-controls={`cat-${cat.id}-list`}
                      >
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{cat.navn}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {cat.funksjoner.length} funksjon{cat.funksjoner.length === 1 ? '' : 'er'}
                          </p>
                        </div>
                        {!isFiltered && (
                          <ChevronRightIcon
                            size={18}
                            className={`text-slate-300 flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </button>
                      {isOpen && (
                        <ul
                          id={`cat-${cat.id}-list`}
                          className="border-t border-slate-100 bg-slate-50/50"
                        >
                          {cat.funksjoner.map((f, i) => {
                            const featureId = `${cat.id}-${i}`
                            const hasDescription = Boolean(f.beskrivelse)
                            const isActive = activeFeature === featureId
                            return (
                              <li
                                key={featureId}
                                className={i < cat.funksjoner.length - 1 ? 'border-b border-slate-100' : ''}
                              >
                                <button
                                  type="button"
                                  onClick={() => hasDescription && setActiveFeature(prev => prev === featureId ? null : featureId)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                    hasDescription ? 'hover:bg-slate-100 active:bg-slate-200 cursor-pointer' : 'cursor-default'
                                  }`}
                                  aria-expanded={isActive}
                                  aria-controls={isActive ? `${featureId}-detail` : undefined}
                                  disabled={!hasDescription}
                                >
                                  <div className="flex-1 text-sm text-slate-700 leading-snug">{f.navn}</div>
                                  <StatusBadge status={f.status} />
                                </button>
                                {isActive && f.beskrivelse && (
                                  <div
                                    id={`${featureId}-detail`}
                                    className="px-4 pt-2 pb-3 bg-brand-50/60 border-t border-brand-100"
                                  >
                                    <p className="text-xs text-slate-700 leading-relaxed italic">{f.beskrivelse}</p>
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-base mb-1">Ingen funksjoner matcher</p>
            <button
              onClick={reset}
              className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
            >
              Tilbakestill filter
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Tegnforklaring
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 flex-shrink-0">
                <CheckIcon size={13} />
              </span>
              <span>
                <strong>Inkludert</strong> – følger med M365 E5
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200 flex-shrink-0">
                <PlusIcon size={13} />
              </span>
              <span>
                <strong>Tilleggskjøp</strong> – tilgjengelig som tillegg til M365 E5
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
