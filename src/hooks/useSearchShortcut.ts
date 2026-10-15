import { useEffect, type RefObject } from 'react'
import { useFinePointer } from './useFinePointer'

// Ctrl+K fokuserer søkefeltet på desktop (fin pekerenhet – mus/styreplate).
// Trygt å overstyre med preventDefault: nettlesere lar siden fange denne
// snarveien når den har fokus, i motsetning til f.eks. Ctrl+T/Ctrl+W.
export function useSearchShortcut(inputRef: RefObject<HTMLInputElement | null>): boolean {
  const isDesktop = useFinePointer()

  useEffect(() => {
    if (!isDesktop) return
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'k') return
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDesktop, inputRef])

  return isDesktop
}
