import { use, useEffect, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { fetchVideos } from '../data/loader'
import { useMergedVideos } from '../auth/merge'
import { parseVideoSource } from '../data/video-source'
import { useSeenVersions } from '../lib/SeenVersionsContext'

export function VideoPage() {
  const publicVideos = use(fetchVideos())
  const videos = useMergedVideos(publicVideos)
  const { videoId } = useParams()
  const base = import.meta.env.BASE_URL
  const video = videos.find(v => v.id === videoId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { markVideoSeen } = useSeenVersions()

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      // Browser blocked autoplay – user can start manually via the play button.
    })
  }, [videoId])

  useEffect(() => {
    if (video) markVideoSeen(video.id)
  }, [video, markVideoSeen])

  if (!video) {
    return <Navigate to="/opplaering" replace />
  }

  const source = parseVideoSource(video.fil, base)

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="bg-black rounded-xl overflow-hidden shadow-sm">
          {source.type === 'file' ? (
            <video
              ref={videoRef}
              src={source.src}
              controls
              playsInline
              autoPlay
              preload="auto"
              poster={video.thumbnail ? `${base}${video.thumbnail}` : undefined}
              className="w-full aspect-video bg-black"
            >
              Nettleseren din støtter ikke avspilling av video. Du kan laste ned filen her: <a href={source.src}>{video.fil}</a>.
            </video>
          ) : (
            <iframe
              src={source.embedSrc}
              title={video.tittel ?? 'Video'}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {(video.tittel || video.beskrivelse || video.kilde || video.fotnote) && (
          <div className="mt-4">
            {video.tittel && (
              <h1 className="text-base font-semibold text-slate-800 leading-snug">{video.tittel}</h1>
            )}
            {video.beskrivelse && (
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{video.beskrivelse}</p>
            )}
            {video.kilde && (
              <p className="text-xs text-slate-400 mt-3 leading-snug">Kilde: {video.kilde}</p>
            )}
            {video.fotnote && (
              <p className="text-[11px] italic text-slate-400 mt-2 leading-snug">{video.fotnote}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
