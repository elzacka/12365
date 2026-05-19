import { useEffect, useRef } from 'react'
import { CloseIcon } from './Icons'
import type { ArticleImage } from '../types'

interface ImageLightboxProps {
  image: ArticleImage | null
  onClose: () => void
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (image && !dialog.open) {
      dialog.showModal()
      // Focus the dialog itself so the close-button's focus-visible ring is
      // not shown on programmatic auto-focus.
      dialog.focus()
    } else if (!image && dialog.open) {
      dialog.close()
    }
  }, [image])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      dialogRef.current?.close()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      tabIndex={-1}
      aria-label={image ? `Bilde i fullskjerm: ${image.alt}` : undefined}
      className="lightbox bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full backdrop:bg-black/85 outline-none"
    >
      {image && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-8">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Lukk bilde"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center justify-center w-11 h-11 rounded-full bg-white/95 text-slate-800 shadow-lg hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors z-10"
          >
            <CloseIcon size={22} />
          </button>
          <figure className="flex flex-col items-center max-w-5xl w-full">
            <img
              src={`${import.meta.env.BASE_URL}${image.src}`}
              alt={image.alt}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
            <figcaption className="mt-3 sm:mt-4 px-3 py-2 bg-white/95 rounded-lg text-sm text-slate-700 leading-snug max-w-2xl text-center">
              {image.bildetekst}
              <span className="block text-xs text-slate-500 mt-1">{image.kreditering}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </dialog>
  )
}
