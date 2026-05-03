import { use } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { hentVideoer } from '../data/loader'

export function Video() {
  const videoer = use(hentVideoer())
  const { videoId } = useParams()
  const base = import.meta.env.BASE_URL
  const video = videoer.find(v => v.id === videoId)

  if (!video) {
    return <Navigate to="/videoer" replace />
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="bg-black rounded-xl overflow-hidden shadow-sm">
          <video
            src={`${base}${video.fil}`}
            controls
            playsInline
            preload="metadata"
            poster={video.thumbnail ? `${base}${video.thumbnail}` : undefined}
            className="w-full aspect-video bg-black"
          >
            Nettleseren din støtter ikke avspilling av video. Du kan laste ned filen her: <a href={`${base}${video.fil}`}>{video.fil}</a>.
          </video>
        </div>

        {(video.tittel || video.intro) && (
          <div className="mt-4">
            {video.tittel && (
              <h1 className="text-base font-semibold text-slate-800 leading-snug">{video.tittel}</h1>
            )}
            {video.intro && (
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{video.intro}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
