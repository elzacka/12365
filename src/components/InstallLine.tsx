import { useState } from 'react'
import { installSteps, useInstall } from '../hooks/useInstall'

const stepsId = 'install-steps'

// One quiet line under the header on Home, in a browser tab only: the browser's own install
// prompt where it has one, else the steps for this browser, opened in the line.
export function InstallLine() {
  const install = useInstall()
  const [stepsOpen, setStepsOpen] = useState(false)
  if (!install) return null

  return (
    <div role="note" className="bg-white border-b border-slate-200 px-4 py-2.5">
      <div className="max-w-md mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-sm text-slate-600">Appen virker også uten nett når du legger den på enheten din</span>
        <button
          type="button"
          className="shrink-0 px-3.5 py-1.5 rounded-full bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors"
          {...(install.kind === 'prompt'
            ? { onClick: install.install }
            : { onClick: () => setStepsOpen(o => !o), 'aria-expanded': stepsOpen, 'aria-controls': stepsId })}
        >
          Last ned gratis
        </button>
        {install.kind !== 'prompt' && (
          <span id={stepsId} hidden={!stepsOpen} className="basis-full text-sm text-slate-800">
            {installSteps(install)}
          </span>
        )}
      </div>
    </div>
  )
}
