// Tolker video-kilden — lokal fil, YouTube, Vimeo eller ekstern mp4.

export type VideoKilde =
  | { type: 'fil'; src: string }
  | { type: 'youtube'; embedSrc: string; thumbnailSrc: string }
  | { type: 'vimeo'; embedSrc: string }

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/

export function tolkVideoKilde(fil: string, base: string): VideoKilde {
  const yt = fil.match(YOUTUBE)
  if (yt) {
    const id = yt[1]
    return {
      type: 'youtube',
      // youtube-nocookie sletter ikke sporings-cookies før video faktisk spilles av.
      embedSrc: `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`,
      thumbnailSrc: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    }
  }

  const vimeo = fil.match(VIMEO)
  if (vimeo) {
    const id = vimeo[1]
    return {
      type: 'vimeo',
      embedSrc: `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`,
    }
  }

  const erAbsolutt = /^https?:\/\//i.test(fil)
  return {
    type: 'fil',
    src: erAbsolutt ? fil : `${base}${fil}`,
  }
}
