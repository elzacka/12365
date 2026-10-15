import { useState } from 'react'
import { installSteps, useInstall } from '../hooks/useInstall'
import { CloseIcon } from './Icons'

const stepsId = 'install-steps'

// Shrinks the text until it fits one line at any width; re-fits on resize and once the web font loads.
function fitOneLine(el: HTMLSpanElement | null) {
  if (!el) return
  const fit = () => {
    el.style.fontSize = ''
    const ratio = el.clientWidth / el.scrollWidth
    if (ratio < 1) el.style.fontSize = `${Math.floor(parseFloat(getComputedStyle(el).fontSize) * ratio * 100) / 100}px`
  }
  const observer = new ResizeObserver(fit)
  observer.observe(el)
  void document.fonts.ready.then(fit)
  return () => observer.disconnect()
}
const dismissedKey = 'install-banner-dismissed'

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(dismissedKey) === '1'
  } catch {
    return false
  }
}

// Above the header on Home, in a browser tab only: the browser's own install prompt where it
// has one, else the steps for this browser, opened in the banner. Closing it is remembered.
export function InstallBanner() {
  const install = useInstall()
  const [stepsOpen, setStepsOpen] = useState(false)
  const [dismissed, setDismissed] = useState(wasDismissed)
  if (!install || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(dismissedKey, '1')
    } catch {
      // storage blocked: closed for this visit only
    }
  }

  return (
    <aside aria-label="Installer appen" className="bg-brand-800 text-white">
      <div className="max-w-2xl mx-auto flex items-center gap-2 py-2 pl-1 pr-3">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Lukk"
          className="shrink-0 p-2.5 rounded-full text-brand-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <CloseIcon size={18} />
        </button>
        <span ref={fitOneLine} className="flex-1 min-w-0 text-sm leading-snug whitespace-nowrap overflow-hidden">
          <span className="sm:hidden">Installer appen – virker uten nett</span>
          <span className="hidden sm:inline">Installer appen. Da funker den som en vanlig app og virker uten nett.</span>
        </span>
        <button
          type="button"
          className="shrink-0 px-3.5 py-1.5 rounded-full bg-white text-brand-800 text-sm font-semibold hover:bg-brand-50 transition-colors"
          {...(install.kind === 'prompt'
            ? { onClick: install.install }
            : { onClick: () => setStepsOpen(o => !o), 'aria-expanded': stepsOpen, 'aria-controls': stepsId })}
        >
          Installer
        </button>
      </div>
      {install.kind !== 'prompt' && (
        <p id={stepsId} hidden={!stepsOpen} className="max-w-2xl mx-auto px-4 pb-2.5 text-sm text-brand-50">
          {installSteps(install)}
        </p>
      )}
    </aside>
  )
}
