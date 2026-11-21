import { use, useState } from 'react'
import { fetchKiVurdering } from '../data/loader'
import { FlipFrame } from '../components/FlipCard'
import { ChevronRightIcon } from '../components/Icons'
import { Markdown } from '../lib/markdown'
import type { KiVurdering as KiVurderingData } from '../types'

function ExpandBox({ id, tittel, tekst }: KiVurderingData['bokser'][number]) {
  const [open, setOpen] = useState(false)
  const panelId = `ki-vurdering-${id}`

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <h2>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
        >
          <span className="flex-1 text-sm font-semibold text-brand-700">{tittel}</span>
          <ChevronRightIcon
            size={18}
            className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </button>
      </h2>
      {open && (
        <div id={panelId} className="border-t border-slate-100 px-4 py-1 [&_.markdown>:first-child]:mt-3 [&_.markdown>:last-child]:mb-3">
          <Markdown source={tekst} />
        </div>
      )}
    </section>
  )
}

const LABEL = 'text-[0.65rem] font-semibold uppercase tracking-wider'

const STRIPE: Record<KiVurderingData['kort'][number]['farge'], string> = {
  rod: 'bg-red-600',
  oransje: 'bg-orange-500',
  gul: 'bg-yellow-400',
  gronn: 'bg-green-600',
}

function Stripe({ farge }: { farge: KiVurderingData['kort'][number]['farge'] }) {
  return <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-2 ${STRIPE[farge]}`} />
}

export function KiVurdering() {
  const { bokser, veiledning, kort, merknad } = use(fetchKiVurdering())

  return (
    <main className="flex-1 bg-slate-50 px-4 pt-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3 mb-5">
          {bokser.map(b => <ExpandBox key={b.id} {...b} />)}
        </div>

        <p className="text-sm text-slate-600 leading-snug mb-3">{veiledning}</p>

        {/* auto-rows-fr: every row takes the tallest card's height, so all cards match whatever their text. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-3">
          {kort.map((k, i) => (
            <FlipFrame
              key={k.id}
              label={`Snu kort ${i + 1}, ${k.tittel}`}
              className="h-full"
              frontClassName="bg-white border border-slate-200 shadow-sm flex flex-col p-4 pt-6 pb-9 text-left hover:shadow-md transition-shadow"
              backClassName="bg-brand-700 flex flex-col p-4 pt-6 pb-9 text-left"
              front={
                <>
                  <Stripe farge={k.farge} />
                  <p className={`${LABEL} text-brand-400`}>{i + 1} · {k.tittel}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-800 leading-snug">{k.sporsmal}</h3>
                  <p className={`${LABEL} mt-3 mb-1 text-slate-500`}>For eksempel</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 leading-snug">
                    {k.eksempler.map(e => <li key={e}>{e}</li>)}
                  </ul>
                </>
              }
              back={
                <>
                  <Stripe farge={k.farge} />
                  <p className={`${LABEL} text-brand-200`}>{i + 1} · {k.tittel}</p>
                  <p className="mt-1 text-base font-semibold text-white leading-snug">{k.svar}</p>
                  <ul className="mt-3 list-disc pl-4 space-y-1.5 text-xs text-white leading-snug">
                    {k.punkter.map(p => <li key={p}>{p}</li>)}
                  </ul>
                  <p className="mt-auto pt-3 text-[0.65rem] text-brand-200">{k.kilde}</p>
                </>
              }
            />
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500 leading-snug">{merknad}</p>
      </div>
    </main>
  )
}
