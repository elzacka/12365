import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLinkIcon } from '../components/Icons'

// Minimal markdown-renderer skreddersydd for korte sider som «Om appen»
// og «Personvern». Støtter:
// - Overskrifter på 4 nivåer (#, ##, ###, ####)
// - Avsnitt med myke linjeskift
// - **fet tekst** og *kursiv*
// - Lenker [tekst](url) — interne (/sti) går via React Router,
//   eksterne (https://...) får target="_blank" og rel="noopener noreferrer"
// - Punktlister (- ...) og nummererte lister (1. ...)
//
// Ingen runtime-avhengigheter. For mer avansert markdown — bytt til
// remark/react-markdown og oppdater testene først.

const inlineRegex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIdx = 0
  let key = 0

  for (const match of text.matchAll(inlineRegex)) {
    const start = match.index ?? 0
    if (start > lastIdx) {
      nodes.push(text.slice(lastIdx, start))
    }
    const m = match[0]

    if (m.startsWith('**')) {
      nodes.push(
        <strong key={`s-${key++}`} className="font-semibold text-slate-800">
          {m.slice(2, -2)}
        </strong>
      )
    } else if (m.startsWith('*')) {
      nodes.push(
        <em key={`e-${key++}`} className="italic">
          {m.slice(1, -1)}
        </em>
      )
    } else {
      const linkMatch = m.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (linkMatch) {
        const [, label, url] = linkMatch
        const eksternal = /^https?:\/\//i.test(url) || /^mailto:/i.test(url)
        const linkClass = 'text-brand-400 hover:text-brand-600 transition-colors'
        if (eksternal) {
          nodes.push(
            <a
              key={`a-${key++}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {label}
              <ExternalLinkIcon size={11} className="inline-block ml-0.5 align-[-0.125em]" />
            </a>
          )
        } else {
          nodes.push(
            <Link key={`a-${key++}`} to={url} className={linkClass}>
              {label}
            </Link>
          )
        }
      } else {
        nodes.push(m)
      }
    }
    lastIdx = start + m.length
  }
  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx))
  }
  return nodes
}

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

  return (
    <p key={`p-${idx}`} className="text-sm text-slate-700 leading-relaxed my-3">
      {lines.map((linje, i) => (
        <span key={`p-${idx}-l-${i}`}>
          {parseInline(linje)}
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
