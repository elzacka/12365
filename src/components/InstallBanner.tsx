import { useEffect, useState } from 'react'
import { CloseIcon } from './Icons'

// Standard PWA install-prompt-event (not yet in lib.dom.d.ts)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'install-banner-dismissed'

function isInstalled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) return true
  return false
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function InstallBanner() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return true
    if (isInstalled()) return true
    return localStorage.getItem(DISMISS_KEY) === 'true'
  })
  const [iosHintAvailable] = useState(() => {
    if (typeof window === 'undefined') return false
    return isIOS() && !isInstalled()
  })
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSHint, setShowIOSHint] = useState(false)

  useEffect(() => {
    if (hidden) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setPrompt(null)
      setHidden(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [hidden])

  if (hidden) return null
  if (!prompt && !iosHintAvailable) return null

  const install = async () => {
    if (iosHintAvailable && !prompt) {
      setShowIOSHint(s => !s)
      return
    }
    if (!prompt) return
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') {
      setHidden(true)
    }
  }

  const close = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.setItem(DISMISS_KEY, 'true')
    setHidden(true)
  }

  return (
    <div className="sticky top-0 z-50 bg-brand-700 text-white text-xs safe-top shadow-sm">
      <div className="flex items-center">
        <button
          type="button"
          onClick={install}
          aria-expanded={iosHintAvailable && !prompt ? showIOSHint : undefined}
          aria-controls={iosHintAvailable && !prompt ? 'install-banner-ios-hint' : undefined}
          className="flex-1 py-2 px-4 text-left hover:bg-brand-800 transition-colors font-medium"
        >
          Klikk her for å installere 12365 som app
        </button>
        <button
          type="button"
          onClick={close}
          className="p-2 mr-1 text-white/90 hover:text-white hover:bg-brand-800 rounded transition-colors"
          aria-label="Lukk"
        >
          <CloseIcon size={16} />
        </button>
      </div>
      {iosHintAvailable && !prompt && showIOSHint && (
        <p
          id="install-banner-ios-hint"
          role="region"
          aria-label="Installeringshjelp for iOS"
          className="px-4 pb-2 pt-0 text-xs leading-snug text-white"
        >
          Trykk på Del-ikonet i Safari og velg «Legg til på Hjem-skjerm».
        </p>
      )}
    </div>
  )
}
