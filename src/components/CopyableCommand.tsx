import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon } from './Icons'

// Inline copy-to-clipboard chip for command syntax in articles. The entire
// chip is the tap target — no separate icon button to hunt for. Works the
// same on touch and pointer. The floating "Kopiert" label is absolutely
// positioned so it never shifts the surrounding text.
export function CopyableCommand({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <span className="relative inline-block align-baseline">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Kopier kommando: ${text}`}
        className="group inline-flex items-center gap-1.5 font-mono text-[0.85em] text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 active:bg-amber-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer touch-manipulation select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        <span>{text}</span>
        <span
          aria-hidden="true"
          className={`inline-flex items-center transition-colors ${
            copied ? 'text-emerald-600' : 'text-amber-700/60 group-hover:text-amber-800'
          }`}
        >
          {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
        </span>
      </button>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-0.5 rounded bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-sm transition-opacity duration-150 ${
          copied ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Kopiert
      </span>
      <span role="status" className="sr-only">
        {copied ? 'Kommandoen er kopiert til utklippstavlen' : ''}
      </span>
    </span>
  )
}
