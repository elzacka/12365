// Parses the video source — local file, YouTube, Vimeo or external mp4.

export type VideoSource =
  | { type: 'file'; src: string }
  | { type: 'youtube'; embedSrc: string; thumbnailSrc: string }
  | { type: 'vimeo'; embedSrc: string }

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/

export function parseVideoSource(file: string, base: string): VideoSource {
  const yt = file.match(YOUTUBE)
  if (yt) {
    const id = yt[1]
    return {
      type: 'youtube',
      // youtube-nocookie does not drop tracking cookies before the video is played.
      embedSrc: `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`,
      thumbnailSrc: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
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

  const isAbsolute = /^https?:\/\//i.test(file)
  return {
    type: 'file',
    src: isAbsolute ? file : `${base}${file}`,
  }
}
