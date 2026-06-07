import { useEffect, use, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fetchCourses, fetchVideos } from '../data/loader'
import { useMergedCourses, useMergedVideos } from '../auth/merge'
import { ExternalLinkIcon, GraduationCapIcon, VideoIcon } from '../components/Icons'
import { UpdateDot } from '../components/UpdateDot'
import { useSeenVersions } from '../lib/SeenVersionsContext'
import { parseVideoSource } from '../data/video-source'
import type { OpplaeringBody } from '../types'

interface TileBodyProps extends OpplaeringBody {
  trailingIcon?: ReactNode
}

// Shared text template for video and course tiles. Each line renders only when
// its field is non-empty, so authors can leave placeholders in the JSON.
function TileBody({ tittel, beskrivelse, kilde, fotnote, trailingIcon }: TileBodyProps) {
  if (!tittel && !beskrivelse && !kilde && !fotnote) return null
  return (
    <div className="px-3 py-2.5">
      {tittel && (
        <p className="text-sm font-medium text-slate-800 leading-snug flex items-start gap-1.5">
          <span>{tittel}</span>
          {trailingIcon}
        </p>
      )}
      {beskrivelse && (
        <p className="text-xs text-slate-500 mt-1.5 leading-snug">{beskrivelse}</p>
      )}
      {kilde && (
        <p className="text-xs text-slate-400 mt-2 leading-snug">Kilde: {kilde}</p>
      )}
      {fotnote && (
        <p className="text-[11px] italic text-slate-400 mt-2 leading-snug">{fotnote}</p>
      )}
    </div>
  )
}

export function Opplaering() {
  const publicVideos = use(fetchVideos())
  const publicCourses = use(fetchCourses())
  const videos = useMergedVideos(publicVideos)
  const courses = useMergedCourses(publicCourses)
  const base = import.meta.env.BASE_URL
  const { markAllVideosSeen, markAllCoursesSeen, isCourseNew, markCourseSeen } = useSeenVersions()

  useEffect(() => {
    markAllVideosSeen()
  }, [markAllVideosSeen])

  useEffect(() => {
    markAllCoursesSeen()
  }, [markAllCoursesSeen])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto w-full">
        <p className="text-sm text-slate-500 text-center mb-6">
          Se videoer og kursinnhold fra ulike kilder. Direkte og indirekte relatert til M365.
        </p>

        <section aria-labelledby="opplaering-videoer" className="mb-8">
          <h2 id="opplaering-videoer" className="text-base font-semibold text-slate-800 mb-3">Videoer</h2>
          {videos.length === 0 ? (
            <p className="text-sm text-slate-500">Ingen videoer ennå.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {videos.map(v => {
                const thumbnailSrc = v.thumbnail ? `${base}${v.thumbnail}` : null
                const showPlayOverlay = parseVideoSource(v.fil, base).type === 'file'

                return (
                  <Link
                    key={v.id}
                    to={`/opplaering/videoer/${v.id}`}
                    className="group block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md active:scale-[0.99] transition-all"
                    aria-label={v.tittel ? `Spill av ${v.tittel}` : 'Spill av video'}
                  >
                    <div className="relative aspect-video bg-slate-100">
                      {thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          <VideoIcon size={36} />
                        </div>
                      )}
                      {showPlayOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/60 group-hover:bg-black/75 backdrop-blur-sm flex items-center justify-center transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                              <polygon points="6 4 20 12 6 20 6 4" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <TileBody
                      tittel={v.tittel}
                      beskrivelse={v.beskrivelse}
                      kilde={v.kilde}
                      fotnote={v.fotnote}
                    />
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="opplaering-kurs">
          <h2 id="opplaering-kurs" className="text-base font-semibold text-slate-800 mb-3">Kursinnhold</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">Ingen kurs ennå.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {courses.map(c => {
                const thumbnailSrc = c.thumbnail ? `${base}${c.thumbnail}` : null
                const showDot = isCourseNew(c.id)

                return (
                  <a
                    key={c.id}
                    href={c.lenke}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => markCourseSeen(c.id)}
                    className="group relative block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md active:scale-[0.99] transition-all"
                    aria-label={`Åpne kurset ${c.tittel} i ny fane`}
                  >
                    <UpdateDot visible={showDot} className="absolute top-2 right-2 z-10" />
                    <div className="relative aspect-square bg-slate-100">
                      {thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          <GraduationCapIcon size={40} />
                        </div>
                      )}
                    </div>
                    <TileBody
                      tittel={c.tittel}
                      beskrivelse={c.beskrivelse}
                      kilde={c.kilde}
                      fotnote={c.fotnote}
                      trailingIcon={<ExternalLinkIcon size={12} className="text-slate-400 shrink-0 mt-1" />}
                    />
                  </a>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
