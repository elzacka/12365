import { useSyncExternalStore } from 'react'

// How this browser installs the app, if it can and has not already: Chrome, Edge and Android
// hand over a prompt, kept for a click; Safari has none, so the answer is where its menu item
// is (behind ••• on an iPhone from iOS 26, on the bar on an iPad and in other iPhone browsers).
export type Install =
  | { kind: 'prompt'; install: () => void }
  | { kind: 'ios-more' }
  | { kind: 'ios-share' }
  | { kind: 'mac-safari' }
  | null

type PromptEvent = Event & { prompt: () => Promise<void> }

let deferred: PromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => {
  for (const l of listeners) l()
}

// Registered when the module loads, before the browser fires the event.
// preventDefault keeps Chrome's own mini bar away; the address-bar icon stays.
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  deferred = e as PromptEvent
  notify()
})
window.addEventListener('appinstalled', () => {
  deferred = null
  notify()
})

// Left by the floating install card; nothing reads it any more.
try {
  localStorage.removeItem('install-prompt-dismissed-v2')
} catch {
  // storage blocked: nothing to clean
}

function installed(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

function current(): Install {
  if (installed()) return null
  if (deferred) {
    const e = deferred
    return {
      kind: 'prompt',
      install: () => {
        void e.prompt()
        deferred = null
        notify()
      },
    }
  }
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac; the touch points give it away
  if (/iPhone|iPod/.test(ua)) return { kind: /CriOS|FxiOS|EdgiOS/.test(ua) ? 'ios-share' : 'ios-more' }
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return { kind: 'ios-share' }
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua)) return { kind: 'mac-safari' }
  return null
}

let snapshot = current()

export function useInstall(): Install {
  return useSyncExternalStore(
    l => {
      const wrapped = () => {
        snapshot = current()
        l()
      }
      listeners.add(wrapped)
      return () => listeners.delete(wrapped)
    },
    () => snapshot,
  )
}

// Where the menu item is, in a browser with no install prompt of its own
export function installSteps(install: Install): string {
  if (install?.kind === 'ios-more') return 'Trykk på •••, velg Del og så Legg til på Hjem-skjermen'
  if (install?.kind === 'ios-share') return 'Trykk på Del og velg Legg til på Hjem-skjermen'
  if (install?.kind === 'mac-safari') return 'Klikk på Del og velg Legg til i Dock'
  return ''
}
