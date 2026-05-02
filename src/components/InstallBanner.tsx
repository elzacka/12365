import { useEffect, useState } from 'react'
import { CloseIcon } from './Icons'

// Standard PWA install-prompt-event (ikke i lib.dom.d.ts ennå)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'install-banner-dismissed'

function erInstallert(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) return true
  return false
}

function erIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [iOSHint, setIOSHint] = useState(false)
  const [skjult, setSkjult] = useState(() => {
    if (typeof window === 'undefined') return true
    if (erInstallert()) return true
    return localStorage.getItem(DISMISS_KEY) === 'true'
  })

  useEffect(() => {
    if (skjult) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setPrompt(null)
      setSkjult(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    if (erIOS() && !erInstallert()) {
      setIOSHint(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [skjult])

  if (skjult) return null
  if (!prompt && !iOSHint) return null

  const installer = async () => {
    if (iOSHint) {
      alert('Trykk på Del-ikonet i Safari og velg «Legg til på Hjem-skjerm».')
      return
    }
    if (!prompt) return
    await prompt.prompt()
    const valg = await prompt.userChoice
    if (valg.outcome === 'accepted') {
      setSkjult(true)
    }
  }

  const lukk = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.setItem(DISMISS_KEY, 'true')
    setSkjult(true)
  }

  return (
    <div className="sticky top-0 z-50 bg-brand-700 text-white text-xs flex items-center safe-top shadow-sm">
      <button
        type="button"
        onClick={installer}
        className="flex-1 py-2 px-4 text-left hover:bg-brand-800 transition-colors font-medium"
      >
        Klikk her for å installere 12365 som app
      </button>
      <button
        type="button"
        onClick={lukk}
        className="p-2 mr-1 text-white/80 hover:text-white hover:bg-brand-800 rounded transition-colors"
        aria-label="Lukk"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  )
}
