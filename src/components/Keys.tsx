import { Fragment, type ReactNode } from 'react'
import { TabKeyIcon, WindowsKeyIcon } from './Icons'

// Key names as Microsoft's nb-no pages write them, shown as the ISO/IEC 9995-7 symbol
// that Nordic keyboards print. Ctrl, Alt, Esc, F-keys and letters are printed as text.
const SYMBOLS: Record<string, ReactNode> = {
  'Windows-tast': <WindowsKeyIcon className="inline-block align-[-1px]" />,
  Skift: '⇧',
  Enter: '↵',
  Tab: <TabKeyIcon className="inline-block align-[-1px]" />,
  'Pil opp': '↑',
  'Pil ned': '↓',
  'Pil venstre': '←',
  'Pil høyre': '→',
  'Likhetstegn (=)': '=',
  'punktum (.)': '.',
}

// Screen readers hear the name, not the symbol: «Likhetstegn (=)» is read «Likhetstegn».
function Key({ name }: { name: string }) {
  const symbol = SYMBOLS[name]
  if (symbol === undefined) return <>{name}</>
  const spoken = name.replace(/\s*\(.\)$/, '')
  return (
    <span title={spoken}>
      <span aria-hidden="true">{symbol}</span>
      <span className="sr-only">{spoken}</span>
    </span>
  )
}

// «**Ctrl+Skift+M**» as one key cap; on a narrow screen it breaks only after a «+».
export function Keys({ combo }: { combo: string }) {
  const parts = combo.replace(/\*\*/g, '').split('+')
  return (
    <kbd className={`shrink-0 max-w-[50%] text-right ${CAP}`}>
      {parts.map((p, i) => (
        <Fragment key={i}>
          <span className="whitespace-nowrap"><Key name={p} />{i < parts.length - 1 && '+'}</span>
          {i < parts.length - 1 && <wbr />}
        </Fragment>
      ))}
    </kbd>
  )
}

const CAP = 'font-sans text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 shadow-[inset_0_-1px_0_var(--color-slate-200)]'

const LEGEND: [ReactNode, string][] = [
  [SYMBOLS['Windows-tast'], 'Windows-tasten'],
  [SYMBOLS.Skift, 'Skift'],
  [SYMBOLS.Enter, 'Enter'],
  [SYMBOLS.Tab, 'Tab'],
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
