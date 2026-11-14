import { Fragment, type ReactNode } from 'react'
import { KeyPauseIcon, TabKeyIcon, WindowsKeyIcon } from './Icons'
import { keyLabel, parseKeys } from '../lib/keys'

const CAP = 'inline-block whitespace-nowrap font-sans text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 shadow-[inset_0_-1px_0_var(--color-slate-200)]'
const ICON = 'inline-block align-[-1px]'

// Screen readers hear the key name, not the symbol.
function Key({ raw }: { raw: string }) {
  const { name, symbol } = keyLabel(raw)
  if (!symbol) return <kbd className={CAP}>{name}</kbd>
  const show = symbol === 'windows' ? <WindowsKeyIcon className={ICON} /> : symbol === 'tab' ? <TabKeyIcon className={ICON} /> : symbol
  return (
    <kbd className={CAP} title={name}>
      <span aria-hidden="true">{show}</span>
      <span className="sr-only">{name}</span>
    </kbd>
  )
}

// Release, then press the next key: Microsoft writes a comma, the app shows a pause sign.
function Pause() {
  return (
    <>
      <KeyPauseIcon className="inline-block align-[-2px] mx-0.5 text-slate-400" />
      <span className="sr-only">, så </span>
    </>
  )
}

export function Keys({ text }: { text: string }) {
  const segments = parseKeys(text)
  return (
    <span className="text-xs text-slate-500 leading-6">
      {segments.map((s, i) => {
        if ('key' in s) return <Key key={i} raw={s.key} />
        const rest = s.text.replace(/\s*\+\s*/g, '+')
        const pause = i > 0 && 'key' in segments[i - 1] && rest.match(/^\s*,\s*/)
        return (
          <Fragment key={i}>
            {pause ? <><Pause />{rest.slice(pause[0].length)}</> : rest}
          </Fragment>
        )
      })}
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

const NOTATION: [ReactNode, string][] = [
  [<Keys text="Alt+F" />, 'Hold inne Alt og trykk på F'],
  [<><KeyPauseIcon className="inline-block text-slate-400" /><span className="sr-only">Pausetegn</span></>, 'Slipp tastene og trykk på neste tast'],
  [<Keys text="Alt+F, X" />, 'Trykk på Alt+F, slipp tastene og trykk på X'],
]

// What «+» and the pause sign between keys mean.
export function KeyNotation() {
  return (
    <ul className="space-y-1.5">
      {NOTATION.map(([keys, meaning]) => (
        <li key={meaning} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-500">
          {keys}
          <span>{meaning}</span>
        </li>
      ))}
    </ul>
  )
}
