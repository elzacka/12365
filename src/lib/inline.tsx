import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLinkIcon } from '../components/Icons'

// Inline-markdown for Markdown-sidene og Ordbok-forklaringene. Egen fil fordi
// react-refresh krever at markdown.tsx bare eksporterer komponenter.

const inlineRegex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+(?:\s+"[^"]*")?\))/g

// Lenkemarkering redusert til lenketeksten, for forhåndsvisning og søkeindeks.
export function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)\s]+(?:\s+"[^"]*")?\)/g, '$1')
}

export function parseInline(text: string): ReactNode[] {
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
      const linkMatch = m.match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/)
      if (linkMatch) {
        const [, label, url, title] = linkMatch
        const isExternal = /^https?:\/\//i.test(url) || /^mailto:/i.test(url)
        const linkClass = 'text-brand-400 hover:text-brand-600 transition-colors'
        if (isExternal) {
          nodes.push(
            <a
              key={`a-${key++}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className={linkClass}
            >
              {label}
              <ExternalLinkIcon size={11} className="inline-block ml-0.5 align-[-0.125em]" />
            </a>
          )
        } else {
          nodes.push(
            <Link key={`a-${key++}`} to={url} title={title} className={linkClass}>
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
