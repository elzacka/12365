import { useEffect, useState } from 'react'

// Standard PWA install-prompt-event (not yet in lib.dom.d.ts)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | { kind: 'installed' }
  | { kind: 'chromium'; promptEvent: BeforeInstallPromptEvent }
  | { kind: 'ios-safari'; isIPad: boolean }
  | { kind: 'macos-safari' }
  | { kind: 'unsupported' }

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  return 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true
}

// iPadOS 13+ later som Mac for nettsider (samme userAgent/platform som macOS)
// med mindre "Be om nettsted for datamaskin" er slått av. maxTouchPoints
// skiller en ekte Mac (0-1) fra et iPad (>1).
function isIPad(): boolean {
  return /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isIPhoneOrIPod(): boolean {
  return /iPhone|iPod/.test(navigator.userAgent)
}

function isMacDesktop(): boolean {
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints <= 1
}

// Ekskluderer alle nettlesere som også stempler "Safari" i sin userAgent
// (alle Chromium-baserte, og alle tredjeparts iOS-nettlesere som er
// tvunget til WebKit men ikke er Safari) - kun ekte Safari skal få
// Safari-spesifikke installasjonssteg.
function isRealSafari(): boolean {
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg\/|EdgA|EdgiOS|OPR|FxiOS|Firefox|SamsungBrowser/.test(ua)
}

function fallbackState(): InstallState {
  if (!isRealSafari()) return { kind: 'unsupported' }
  if (isIPhoneOrIPod()) return { kind: 'ios-safari', isIPad: false }
  if (isIPad()) return { kind: 'ios-safari', isIPad: true }
  if (isMacDesktop()) return { kind: 'macos-safari' }
  return { kind: 'unsupported' }
}

export function useInstallPrompt(): InstallState {
  const [state, setState] = useState<InstallState>(() => {
    if (typeof window === 'undefined') return { kind: 'unsupported' }
    return isStandalone() ? { kind: 'installed' } : fallbackState()
  })

  useEffect(() => {
    if (isStandalone()) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setState({ kind: 'chromium', promptEvent: e as BeforeInstallPromptEvent })
    }
    const onInstalled = () => setState({ kind: 'installed' })

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return state
}
