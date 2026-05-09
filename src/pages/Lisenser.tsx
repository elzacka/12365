import { useState, useMemo, use } from 'react'
import { hentLisensSammenligning } from '../data/loader'
import {
  CheckIcon,
  PlusIcon,
  MinusIcon,
  SearchIcon,
  CloseIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from '../components/Icons'
import type { LisensFunksjon, LisensStatus } from '../types'

type FilterId = 'alle' | 'e3' | 'e5' | 'ekstralisens'

const FILTRE: { id: FilterId; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'e3', label: 'E3' },
  { id: 'e5', label: 'E5' },
  { id: 'ekstralisens', label: 'Ekstralisens' },
]

const STATUS_KONFIG: Record<
  LisensStatus,
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
  ikke: {
    bg: 'bg-slate-100',
    text: 'text-slate-400',
    ring: 'ring-slate-200',
    Icon: MinusIcon,
    label: 'Ikke inkludert',
  },
}

function passerFilter(f: LisensFunksjon, aktive: Set<FilterId>): boolean {
  if (aktive.has('alle')) return true
  if (aktive.has('e3') && f.e3 === 'inkludert') return true
  if (aktive.has('e5') && f.e5 === 'inkludert') return true
  if (aktive.has('ekstralisens') && (f.e3 === 'tillegg' || f.e5 === 'tillegg')) return true
  return false
}

function StatusBadge({ status, lisens }: { status: LisensStatus; lisens: 'E3' | 'E5' }) {
  const k = STATUS_KONFIG[status]
  const { Icon } = k
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-slate-500 w-5 text-right tabular-nums">{lisens}</span>
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${k.bg} ${k.text} ring-1 ${k.ring}`}
        aria-label={`${lisens}: ${k.label}`}
        title={`${lisens}: ${k.label}`}
      >
        <Icon size={13} />
      </span>
    </div>
  )
}

export function Lisenser() {
  const data = use(hentLisensSammenligning())
  const [aktiveFiltre, setAktiveFiltre] = useState<Set<FilterId>>(new Set(['alle']))
  const [sok, setSok] = useState('')
  const [utvidet, setUtvidet] = useState<Set<string>>(new Set())
  const [aktivFunksjon, setAktivFunksjon] = useState<string | null>(null)

  const sokNorm = sok.trim().toLowerCase()
  const erFiltrert = !aktiveFiltre.has('alle') || sokNorm.length > 0
  const visE3Badge = aktiveFiltre.has('alle') || aktiveFiltre.has('e3') || aktiveFiltre.has('ekstralisens')
  const visE5Badge = aktiveFiltre.has('alle') || aktiveFiltre.has('e5') || aktiveFiltre.has('ekstralisens')

  const filtreteKategorier = useMemo(() => {
    return data.kategorier
      .map(kat => ({
        ...kat,
        funksjoner: kat.funksjoner.filter(f => {
          // Skjul funksjoner uten relevans for E3 eller E5 (bedre alternativ inkludert,
          // f.eks. Exchange Plan 1 og SharePoint Plan 1 — Plan 2 følger med).
          if (f.e3 === 'ikke' && f.e5 === 'ikke') return false
          return passerFilter(f, aktiveFiltre) && (sokNorm ? f.navn.toLowerCase().includes(sokNorm) : true)
        }),
      }))
      .filter(kat => kat.funksjoner.length > 0)
  }, [data, aktiveFiltre, sokNorm])

  function toggleFilter(id: FilterId) {
    setAktiveFiltre(prev => {
      // Klikk «Alle» nullstiller alt
      if (id === 'alle') return new Set<FilterId>(['alle'])

      const next = new Set(prev)
      next.delete('alle')

      if (id === 'e3' || id === 'e5') {
        // E3 og E5 er gjensidig utelukkende
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
          next.delete(id === 'e3' ? 'e5' : 'e3')
        }
      } else if (id === 'ekstralisens') {
        if (next.has('ekstralisens')) next.delete('ekstralisens')
        else next.add('ekstralisens')
      }

      if (next.size === 0) return new Set<FilterId>(['alle'])
      return next
    })
  }

  function toggleKategori(id: string) {
    if (erFiltrert) return
    setUtvidet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function tilbakestill() {
    setAktiveFiltre(new Set<FilterId>(['alle']))
    setSok('')
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-10 max-w-2xl mx-auto w-full">
        {/* Kilde */}
        <p className="text-center text-sm mb-3">
          <a
            href={data.kildeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-600 transition-colors"
          >
            Kilde: {data.kilde}
            <ExternalLinkIcon size={11} className="inline-block ml-0.5 align-[-0.125em]" />
          </a>
        </p>

        {/* Søk */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="search"
            placeholder="Søk etter app, tjeneste eller funksjon. Trykk på den for å se hva den brukes til."
            value={sok}
            onChange={e => setSok(e.target.value)}
            className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            aria-label="Søk i lisensfunksjoner"
          />
          {sok && (
            <button
              onClick={() => setSok('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Tøm søk"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Filterchips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 hide-scrollbar -mx-4 px-4">
          {FILTRE.map(f => {
            const erAktiv = aktiveFiltre.has(f.id)
            return (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                  erAktiv
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                aria-pressed={erAktiv}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Tema-grupper */}
        {data.tema.map(tema => {
          const kategorier = filtreteKategorier.filter(k => k.tema === tema.id)
          if (kategorier.length === 0) return null
          const totalIThema = kategorier.reduce((sum, k) => sum + k.funksjoner.length, 0)
          return (
            <section key={tema.id} className="mb-6" aria-labelledby={`tema-${tema.id}`}>
              <header className="mb-2 px-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    id={`tema-${tema.id}`}
                    className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {tema.navn}
                  </h2>
                  <span className="text-[11px] font-medium text-slate-400 tabular-nums">{totalIThema}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{tema.beskrivelse}</p>
              </header>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {kategorier.map((kat, idx) => {
                  const apen = erFiltrert || utvidet.has(kat.id)
                  return (
                    <div key={kat.id} className={idx > 0 ? 'border-t border-slate-100' : ''}>
                      <button
                        onClick={() => toggleKategori(kat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
                          erFiltrert ? 'cursor-default' : 'hover:bg-slate-50 active:bg-slate-100'
                        }`}
                        aria-expanded={apen}
                        aria-controls={`kat-${kat.id}-list`}
                      >
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{kat.navn}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {kat.funksjoner.length} funksjon{kat.funksjoner.length === 1 ? '' : 'er'}
                          </p>
                        </div>
                        {!erFiltrert && (
                          <ChevronRightIcon
                            size={18}
                            className={`text-slate-300 flex-shrink-0 transition-transform duration-200 ${
                              apen ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </button>
                      {apen && (
                        <ul
                          id={`kat-${kat.id}-list`}
                          className="border-t border-slate-100 bg-slate-50/50"
                        >
                          {kat.funksjoner.map((f, i) => {
                            const funksjonId = `${kat.id}-${i}`
                            const harBeskrivelse = Boolean(f.beskrivelse)
                            const erAktiv = aktivFunksjon === funksjonId
                            return (
                              <li
                                key={funksjonId}
                                className={i < kat.funksjoner.length - 1 ? 'border-b border-slate-100' : ''}
                              >
                                <button
                                  type="button"
                                  onClick={() => harBeskrivelse && setAktivFunksjon(prev => prev === funksjonId ? null : funksjonId)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                    harBeskrivelse ? 'hover:bg-slate-100 active:bg-slate-200 cursor-pointer' : 'cursor-default'
                                  }`}
                                  aria-expanded={erAktiv}
                                  aria-controls={erAktiv ? `${funksjonId}-detalj` : undefined}
                                  disabled={!harBeskrivelse}
                                >
                                  <div className="flex-1 text-sm text-slate-700 leading-snug">{f.navn}</div>
                                  <div className="flex flex-col gap-1 flex-shrink-0">
                                    {visE3Badge && <StatusBadge status={f.e3} lisens="E3" />}
                                    {visE5Badge && <StatusBadge status={f.e5} lisens="E5" />}
                                  </div>
                                </button>
                                {erAktiv && f.beskrivelse && (
                                  <div
                                    id={`${funksjonId}-detalj`}
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

        {/* Tom-tilstand */}
        {filtreteKategorier.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base mb-1">Ingen funksjoner matcher</p>
            <button
              onClick={tilbakestill}
              className="text-sm text-brand-700 hover:text-brand-800 transition-colors"
            >
              Tilbakestill filter
            </button>
          </div>
        )}

        {/* Tegnforklaring */}
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
                <strong>Inkludert</strong> — følger med lisensen
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200 flex-shrink-0">
                <PlusIcon size={13} />
              </span>
              <span>
                <strong>Tilleggskjøp</strong> — tilgjengelig som tillegg
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200 flex-shrink-0">
                <MinusIcon size={13} />
              </span>
              <span>
                <strong>Ikke inkludert</strong> — ikke tilgjengelig
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
