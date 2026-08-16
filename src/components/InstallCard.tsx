import { useEffect, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { CloseIcon, PlusIcon, ShareIcon } from './Icons'
import { InstallSheet } from './InstallSheet'

const DISMISS_KEY = 'install-prompt-dismissed-v2'
const SHOW_DELAY_MS = 13000

export function InstallCard() {
  const install = useInstallPrompt()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(DISMISS_KEY) === 'true'
  })
  const [elapsed, setElapsed] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [coarsePointer, setCoarsePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )

  // Kort forsinkelse før kortet vises – avbryter ikke det aller første inntrykket av siden.
  useEffect(() => {
    const t = window.setTimeout(() => setElapsed(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    const onChange = () => setCoarsePointer(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  if (dismissed || !elapsed) return null
  if (install.kind === 'installed' || install.kind === 'unsupported') return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  const handleAction = async () => {
    if (install.kind === 'chromium') {
      await install.promptEvent.prompt()
      const choice = await install.promptEvent.userChoice
      if (choice.outcome === 'accepted') dismiss()
      return
    }
    setSheetOpen(true)
  }

  const title =
    install.kind === 'chromium'
      ? 'Installer 12365.'
      : install.kind === 'ios-safari'
        ? 'Legg 12365 til på Hjem-skjerm.'
        : 'Legg 12365 til i Dock.'

  const body =
    install.kind === 'chromium'
      ? coarsePointer
        ? 'Trykk for å legge appen på hjemskjermen.'
        : 'Klikk for å legge appen til som eget program.'
      : install.kind === 'ios-safari'
        ? 'Trykk for å se hvordan.'
        : 'Klikk for å se hvordan.'

  const actionLabel = install.kind === 'chromium' ? 'Installer' : 'Se hvordan'

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="fixed left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-brand-700 text-white rounded-xl shadow-xl shadow-brand-900/30 flex items-center gap-3 pl-4 pr-2 py-2.5 bottom-[calc(env(safe-area-inset-bottom)+1rem)]"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 shrink-0">
          {install.kind === 'chromium' ? <PlusIcon size={16} /> : <ShareIcon size={16} />}
        </span>
        <p className="text-sm flex-1 leading-snug">
          <span className="font-medium">{title}</span> {body}
        </p>
        <button
          type="button"
          onClick={handleAction}
          className="shrink-0 px-3 py-1.5 bg-white text-brand-700 text-sm font-semibold rounded-lg hover:bg-brand-50 active:bg-brand-100 transition-colors"
        >
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          aria-label="Lukk varsel"
        >
          <CloseIcon size={18} />
        </button>
      </div>
      {sheetOpen && (
        <InstallSheet
          variant={install.kind === 'ios-safari' ? 'ios-safari' : 'macos-safari'}
          isIPad={install.kind === 'ios-safari' ? install.isIPad : false}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  )
}
