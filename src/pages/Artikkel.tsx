import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ARTICLE_CATEGORIES } from '../data/articles'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons'

// Enkel markdown-til-JSX for fet tekst og linjeskift
function parseInnhold(tekst: string) {
  const deler = tekst.split(/(\*\*[^*]+\*\*)/)
  return deler.map((del, i) => {
    if (del.startsWith('**') && del.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-800">{del.slice(2, -2)}</strong>
    }
    // Linjeskift
    return del.split('\n').map((linje, j, arr) => (
      <span key={`${i}-${j}`}>
        {linje}
        {j < arr.length - 1 && <br />}
      </span>
    ))
  })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function Artikkel() {
  const { kategoriId, artikkelId } = useParams()
  const [aktivtSteg, setAktivtSteg] = useState(0)

  const kategori = ARTICLE_CATEGORIES.find(k => k.id === kategoriId)
  const artikkel = kategori?.artikler.find(a => a.id === artikkelId)
  const antallSteg = artikkel?.steg.length ?? 0

  const gaForrige = () => {
    setAktivtSteg(s => Math.max(0, s - 1))
    scrollToTop()
  }

  const gaNeste = () => {
    setAktivtSteg(s => Math.min(antallSteg - 1, s + 1))
    scrollToTop()
  }

  const gaTilSteg = (idx: number) => {
    setAktivtSteg(idx)
    scrollToTop()
  }

  if (!artikkel || !kategori) {
    return <Navigate to="/slik-gjor-du" replace />
  }

  const erForsteSteg = aktivtSteg === 0
  const erSisteSteg = aktivtSteg === antallSteg - 1
  const fremgang = ((aktivtSteg + 1) / antallSteg) * 100
  const steg = artikkel.steg[aktivtSteg]

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Kategori-header */}
      <div className="bg-brand-700 text-white px-4 pt-4 pb-6">
        <Link
          to="/slik-gjor-du"
          className="inline-flex items-center gap-1 text-brand-200 hover:text-white text-sm mb-3 transition-colors"
        >
          <ChevronLeftIcon size={16} />
          <span>{kategori.tittel}</span>
        </Link>
        <h1 className="text-lg font-bold leading-snug">{artikkel.tittel}</h1>
        <p className="text-brand-100 text-sm mt-1 leading-relaxed">{artikkel.ingress}</p>
      </div>

      {/* Fremdriftslinje */}
      <div className="h-1 bg-brand-100">
        <div
          className="h-full bg-brand-700 transition-all duration-300"
          style={{ width: `${fremgang}%` }}
          role="progressbar"
          aria-valuenow={aktivtSteg + 1}
          aria-valuemin={1}
          aria-valuemax={antallSteg}
          aria-label={`Steg ${aktivtSteg + 1} av ${antallSteg}`}
        />
      </div>

      <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Steg-oversikt (chips) */}
        <nav aria-label="Steg-oversikt" className="flex gap-2 py-4 overflow-x-auto hide-scrollbar">
          {artikkel.steg.map((_, idx) => (
            <button
              key={idx}
              onClick={() => gaTilSteg(idx)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                idx === aktivtSteg
                  ? 'bg-brand-700 text-white shadow-sm'
                  : idx < aktivtSteg
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-white border border-slate-200 text-slate-500'
              }`}
              aria-current={idx === aktivtSteg ? 'step' : undefined}
              aria-label={`Gå til steg ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </nav>

        {/* Steg-innhold */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 bg-brand-50 border-b border-brand-100">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-0.5">
              Steg {aktivtSteg + 1} av {antallSteg}
            </p>
            <h2 className="text-base font-semibold text-slate-800 leading-snug">{steg.tittel}</h2>
          </div>
          <div className="px-4 py-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              {parseInnhold(steg.innhold)}
            </p>
            {steg.bilde && (
              <figure className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={`${import.meta.env.BASE_URL}${steg.bilde.src}`}
                  alt={steg.bilde.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto block"
                />
                <figcaption className="px-3 py-2 text-xs text-slate-600 leading-snug">
                  {steg.bilde.bildetekst}
                  <span className="block text-[11px] text-slate-400 mt-1">{steg.bilde.kreditering}</span>
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        {/* Navigasjonsknapper */}
        <div className="flex items-center gap-3">
          <button
            onClick={gaForrige}
            disabled={erForsteSteg}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              erForsteSteg
                ? 'text-slate-300 bg-white border border-slate-100 cursor-not-allowed'
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
            aria-label="Forrige steg"
          >
            <ChevronLeftIcon size={18} />
            Forrige
          </button>

          <div className="flex-1 text-center">
            <span className="text-xs text-slate-400">
              {aktivtSteg + 1} / {antallSteg}
            </span>
          </div>

          {erSisteSteg ? (
            <Link
              to="/slik-gjor-du"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 shadow-sm transition-colors"
            >
              Ferdig
            </Link>
          ) : (
            <button
              onClick={gaNeste}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 shadow-sm transition-colors"
              aria-label="Neste steg"
            >
              Neste
              <ChevronRightIcon size={18} />
            </button>
          )}
        </div>

        {/* Relaterte artikler (vises på siste steg) */}
        {erSisteSteg && artikkel.relaterte && artikkel.relaterte.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Relaterte veiledninger</h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {artikkel.relaterte.map((relId, idx, arr) => {
                const relKat = ARTICLE_CATEGORIES.find(k => k.artikler.some(a => a.id === relId))
                const relArt = relKat?.artikler.find(a => a.id === relId)
                if (!relArt || !relKat) return null
                return (
                  <Link
                    key={relId}
                    to={`/slik-gjor-du/${relKat.id}/${relId}`}
                    onClick={() => setAktivtSteg(0)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      idx < arr.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{relArt.tittel}</p>
                    </div>
                    <ChevronRightIcon size={16} className="text-slate-300" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
