import { Fragment, type ReactNode } from 'react'
import { TabKeyIcon, WindowsKeyIcon } from './Icons'
import { keyLabel, parseKeys } from '../lib/keys'

const CAP = 'inline-block whitespace-nowrap font-sans text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 shadow-[inset_0_-1px_0_var(--color-slate-200)]'
const ICON = 'inline-block align-[-1px]'
// Accent marks: the app font draws ^ and ~ as dots.
const MARK = /^[\^~´`¨]$/

// Screen readers hear the key name, not the symbol.
function Key({ raw }: { raw: string }) {
  const { name, symbol } = keyLabel(raw)
  if (!symbol) return <kbd className={CAP}>{name}</kbd>
  const show = symbol === 'windows' ? <WindowsKeyIcon className={ICON} /> : symbol === 'tab' ? <TabKeyIcon className={ICON} /> : symbol
  return (
    <kbd className={CAP} title={name}>
      <span aria-hidden="true" className={MARK.test(symbol) ? 'font-mono text-sm leading-none' : undefined}>{show}</span>
      <span className="sr-only">{name}</span>
    </kbd>
  )
}

export function Keys({ text }: { text: string }) {
  return (
    <span className="text-xs text-slate-500 leading-6">
      {parseKeys(text).map((s, i) => (
        <Fragment key={i}>
          {'key' in s ? <Key raw={s.key} /> : s.text.replace(/\s*\+\s*/g, '+')}
        </Fragment>
      ))}
    </span>
  )
}

const LEGEND: [ReactNode, string][] = [
  [<WindowsKeyIcon className={ICON} />, 'Windows-tasten'],
  ['⇧', 'Skift'],
  ['↵', 'Enter'],
  [<TabKeyIcon className={ICON} />, 'Tab'],
  ['← → ↑ ↓', 'Piltastene'],
]

// What each symbol means, for readers who know the key by name.
export function KeyLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {LEGEND.map(([symbol, name]) => (
        <li key={name} className="flex items-center gap-1.5 text-slate-500">
          <kbd className={CAP} aria-hidden="true">{symbol}</kbd>
          {name}
        </li>
      ))}
    </ul>
  )
}

const NOTATION: [string, string][] = [
  ['Alt+F', 'Hold inne Alt og trykk på F'],
  ['Alt+F, X', 'Trykk på Alt+F, slipp tastene og trykk på X'],
  ['Fn+Pil opp', 'Erstatter Page up. Fn+Pil ned erstatter Page down.'],
  ['Fn+Pil venstre', 'Erstatter Home. Fn+Pil høyre erstatter End.'],
  ['00AB, Alt+X', 'I Word og Outlook: Skriv koden og trykk på Alt+X'],
  ['Windows-tast+punktum (.)', 'I andre apper: Velg Symboler og finn tegnet'],
]

// What «+» and «,» between keys mean.
export function KeyNotation() {
  return (
    <ul className="space-y-1.5">
      {NOTATION.map(([keys, meaning]) => (
        <li key={keys} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-500">
          <Keys text={keys} />
          <span>{meaning}</span>
        </li>
      ))}
    </ul>
  )
}
