// Parses the video source – local file, YouTube, Vimeo, Canva or external mp4.

export type VideoSource =
  | { type: 'file'; src: string }
  | { type: 'youtube'; embedSrc: string }
  | { type: 'vimeo'; embedSrc: string }
  | { type: 'canva'; embedSrc: string }

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/
const CANVA = /canva\.com\/design\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\/watch/

export function parseVideoSource(file: string, base: string): VideoSource {
  const yt = file.match(YOUTUBE)
  if (yt) {
    const id = yt[1]
    return {
      type: 'youtube',
      // youtube-nocookie does not drop tracking cookies before the video is played.
      // Thumbnails are not auto-loaded from img.youtube.com; supply a local thumbnail via the videos.json `thumbnail` field.
      embedSrc: `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`,
    }
  }

  const vimeo = file.match(VIMEO)
  if (vimeo) {
    const id = vimeo[1]
    return {
      type: 'vimeo',
      embedSrc: `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`,
    }
  }

  const canva = file.match(CANVA)
  if (canva) {
    const [, designId, token] = canva
    return {
      type: 'canva',
      embedSrc: `https://www.canva.com/design/${designId}/${token}/watch?embed`,
    }
  }

  const isAbsolute = /^https?:\/\//i.test(file)
  return {
    type: 'file',
    src: isAbsolute ? file : `${base}${file}`,
  }
}
