import { use, useEffect, type CSSProperties } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  MediaController,
  MediaControlBar,
  MediaPlayButton,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaMuteButton,
  MediaFullscreenButton,
} from 'media-chrome/react'
import '../lib/media-chrome-nb'
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
  const { markVideoSeen } = useSeenVersions()

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
            <MediaController
              className="block w-full aspect-video bg-black"
              style={{ '--media-primary-color': '#ffffff', '--media-control-height': '44px' } as CSSProperties}
            >
              <video
                slot="media"
                src={source.src}
                autoPlay
                muted
                playsInline
                preload="auto"
                poster={video.thumbnail ? `${base}${video.thumbnail}` : undefined}
                className="w-full h-full object-contain"
              >
                Nettleseren din støtter ikke avspilling av video. Du kan laste ned filen her: <a href={source.src}>{video.fil}</a>.
              </video>
              <MediaControlBar>
                <MediaPlayButton />
                <MediaTimeRange />
                <MediaTimeDisplay showDuration />
                <MediaMuteButton />
                <MediaFullscreenButton />
              </MediaControlBar>
            </MediaController>
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
              <p className="text-[11px] text-brand-200 mt-3 pt-1 border-t border-slate-100 leading-snug">{video.fotnote}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
