import { use, useEffect, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { hentVideoer } from '../data/loader'
import { tolkVideoKilde } from '../data/video-source'

export function Video() {
  const videoer = use(hentVideoer())
  const { videoId } = useParams()
  const base = import.meta.env.BASE_URL
  const video = videoer.find(v => v.id === videoId)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      // Nettleseren blokkerte autoplay — bruker kan starte manuelt med play-knappen.
    })
  }, [videoId])

  if (!video) {
    return <Navigate to="/videoer" replace />
  }

  const kilde = tolkVideoKilde(video.fil, base)

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="bg-black rounded-xl overflow-hidden shadow-sm">
          {kilde.type === 'fil' ? (
            <video
              ref={videoRef}
              src={kilde.src}
              controls
              playsInline
              autoPlay
              preload="auto"
              poster={video.thumbnail ? `${base}${video.thumbnail}` : undefined}
              className="w-full aspect-video bg-black"
            >
              Nettleseren din støtter ikke avspilling av video. Du kan laste ned filen her: <a href={kilde.src}>{video.fil}</a>.
            </video>
          ) : (
            <iframe
              src={kilde.embedSrc}
              title={video.tittel ?? 'Video'}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
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
