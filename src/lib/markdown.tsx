import type { ReactNode } from 'react'
import { parseInline } from './inline'

// Minimal markdown for «Om» and «Personvern»: #–####, lists, inline from inline.tsx.
// A paragraph starting with <sup> is a footnote. No dependencies; for more, use react-markdown.

const headingClasses: Record<number, string> = {
  1: 'text-2xl font-bold text-slate-800 mt-2 mb-3 leading-tight',
  2: 'text-lg font-semibold text-slate-800 mt-6 mb-2 leading-snug',
  3: 'text-base font-semibold text-slate-800 mt-5 mb-1.5 leading-snug',
  4: 'text-sm font-semibold text-slate-700 mt-4 mb-1 uppercase tracking-wider',
}

function renderBlock(block: string, idx: number): ReactNode {
  const lines = block.split('\n')
  const first = lines[0]

  const headingMatch = first.match(/^(#{1,4})\s+(.*)$/)
  if (headingMatch && lines.length === 1) {
    const [, hashes, content] = headingMatch
    const level = hashes.length
    const className = headingClasses[level]
    const key = `h-${idx}`
    if (level === 1) return <h1 key={key} className={className}>{parseInline(content)}</h1>
    if (level === 2) return <h2 key={key} className={className}>{parseInline(content)}</h2>
    if (level === 3) return <h3 key={key} className={className}>{parseInline(content)}</h3>
    return <h4 key={key} className={className}>{parseInline(content)}</h4>
  }

  if (lines.every(l => /^[-*]\s+/.test(l))) {
    const items = lines.map(l => l.replace(/^[-*]\s+/, ''))
    return (
      <ul
        key={`ul-${idx}`}
        className="list-disc pl-5 space-y-1.5 my-3 text-sm text-slate-700 leading-relaxed"
      >
        {items.map((item, i) => (
          <li key={`ul-${idx}-${i}`}>{parseInline(item)}</li>
        ))}
      </ul>
    )
  }

  if (lines.every(l => /^\d+\.\s+/.test(l))) {
    const items = lines.map(l => l.replace(/^\d+\.\s+/, ''))
    return (
      <ol
        key={`ol-${idx}`}
        className="list-decimal pl-5 space-y-1.5 my-3 text-sm text-slate-700 leading-relaxed"
      >
        {items.map((item, i) => (
          <li key={`ol-${idx}-${i}`}>{parseInline(item)}</li>
        ))}
      </ol>
    )
  }

  const footnote = first.match(/^(<sup>[^<\n]+<\/sup>)\s*(.*)$/)
  if (footnote && lines.length === 1) {
    const [, marker, text] = footnote
    return (
      <p
        key={`fn-${idx}`}
        className="relative flex gap-[0.15em] mt-6 pt-3 text-xs text-slate-500 leading-relaxed before:absolute before:top-0 before:left-0 before:w-10 before:border-t before:border-slate-300"
      >
        <span className="shrink-0">{parseInline(marker)}</span>
        <span>{parseInline(text)}</span>
      </p>
    )
  }

  return (
    <p
      key={`p-${idx}`}
      className="text-sm text-slate-700 leading-relaxed my-3"
    >
      {lines.map((line, i) => (
        <span key={`p-${idx}-l-${i}`}>
          {parseInline(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/)
  return <div className="markdown">{blocks.map(renderBlock)}</div>
}
