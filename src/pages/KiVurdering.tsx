import { use, useState } from 'react'
import { fetchKiVurdering } from '../data/loader'
import { FlipFrame } from '../components/FlipCard'
import { ChevronRightIcon } from '../components/Icons'
import { Markdown } from '../lib/markdown'

export function KiVurdering() {
  const { innledning, kort } = use(fetchKiVurdering())
  const [introOpen, setIntroOpen] = useState(false)

  return (
    <main className="flex-1 bg-slate-50 px-4 pt-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <section className="mb-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h2>
            <button
              type="button"
              onClick={() => setIntroOpen(o => !o)}
              aria-expanded={introOpen}
              aria-controls="ki-vurdering-intro"
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            >
              <span className="flex-1 text-sm font-semibold text-brand-700">{innledning.tittel}</span>
              <ChevronRightIcon
                size={18}
                className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${introOpen ? 'rotate-90' : ''}`}
              />
            </button>
          </h2>
          {introOpen && (
            <div id="ki-vurdering-intro" className="border-t border-slate-100 px-4 py-1 [&_.markdown>:first-child]:mt-3 [&_.markdown>:last-child]:mb-3">
              <Markdown source={innledning.tekst} />
            </div>
          )}
        </section>

        {/* auto-rows-fr: every row takes the tallest card's height, so all cards match whatever their text. */}
        <div className="grid grid-cols-2 auto-rows-fr gap-3">
          {kort.map(k => (
            <FlipFrame
              key={k.id}
              label={`Snu kortet for ${k.tittel}`}
              className="h-full min-h-[11rem]"
              frontClassName="bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 text-center p-4 pb-9 hover:shadow-md transition-shadow"
              backClassName="bg-brand-700 flex flex-col p-4 pb-9 text-left"
              front={
                <>
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight">{k.tittel}</h3>
                  <p className="text-xs text-slate-500 leading-snug">{k.tagline}</p>
                </>
              }
              back={<p className="text-xs text-white leading-snug whitespace-pre-line">{k.tekst}</p>}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
