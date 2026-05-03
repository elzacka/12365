import { use } from 'react'
import { Link } from 'react-router-dom'
import { hentVideoer } from '../data/loader'
import { VideoIcon } from '../components/Icons'

export function Videoer() {
  const videoer = use(hentVideoer())
  const base = import.meta.env.BASE_URL

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-brand-700 text-white px-4 pt-6 pb-8">
        <p className="text-brand-100 text-sm leading-relaxed text-center">
          Korte videoer som forklarer Microsoft 365
        </p>
      </div>

      <div className="bg-brand-700 h-5 relative">
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-slate-50 rounded-t-[1.5rem]" />
      </div>

      <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {videoer.length === 0 ? (
          <p className="text-center py-16 text-slate-400">Ingen videoer ennå.</p>
        ) : (
          <div className="grid gap-4 mt-2">
            {videoer.map(v => (
              <Link
                key={v.id}
                to={`/videoer/${v.id}`}
                className="group block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md active:scale-[0.99] transition-all"
                aria-label={v.tittel ? `Spill av ${v.tittel}` : 'Spill av video'}
              >
                <div className="relative aspect-video bg-slate-100">
                  {v.thumbnail ? (
                    <img
                      src={`${base}${v.thumbnail}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <VideoIcon size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/60 group-hover:bg-black/75 backdrop-blur-sm flex items-center justify-center transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    </div>
                  </div>
                </div>
                {(v.tittel || v.intro) && (
                  <div className="px-4 py-3">
                    {v.tittel && (
                      <p className="text-sm font-medium text-slate-800 leading-snug">{v.tittel}</p>
                    )}
                    {v.intro && (
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{v.intro}</p>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
