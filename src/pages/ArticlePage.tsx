import { useEffect, useEffectEvent, useState, use, type ReactNode, Fragment } from 'react'
import { flushSync } from 'react-dom'
import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'
import { ChevronRightIcon, ExternalLinkIcon, SpyIcon, HeartShareIcon, ZoomInIcon } from '../components/Icons'
import { UntestedWarning } from '../components/UntestedWarning'
import { CopyableCommand } from '../components/CopyableCommand'
import { ImageLightbox } from '../components/ImageLightbox'
import { useSwipe } from '../hooks/useSwipe'
import { useFinePointer } from '../hooks/useFinePointer'
import { useSwipeHint } from '../hooks/useSwipeHint'
import { prefersReducedMotion } from '../lib/motion'
import type { ArticleImage } from '../types'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Fjerner anførselstegn og OR/AND-operatorer slik at det søkeordet brukeren
// faktisk lette etter kan fremheves i artikkelteksten.
function toHighlight(raw: string): string {
  return raw
    .replace(/"/g, '')
    .split(/\s+/)
    .filter(t => !/^(or|and)$/i.test(t))
    .join(' ')
    .trim()
}

function applyHighlight(text: string, query: string): ReactNode[] {
  if (!query) return [text]
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  const parts = text.split(regex)
  if (parts.length === 1) return [text]
  return parts.map((part, i): ReactNode =>
    i % 2 === 1
      ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-[1px]">{part}</mark>
      : part || null
  )
}

// Block-aware markdown-to-JSX: paragraphs, ###, ◦ and 1. lists, `cmd`, [tekst](url).
// Deliberately small: only the syntax articles.json uses.

function parseInline(text: string, hl: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/)
  return parts.map((part, i): ReactNode => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-slate-800">{applyHighlight(part.slice(2, -2), hl)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <CopyableCommand key={i} text={part.slice(1, -1)} />
    }
    if (part.startsWith('[')) {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (linkMatch) {
        const [, label, url] = linkMatch
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-600 transition-colors"
          >
            {applyHighlight(label, hl)}
            <ExternalLinkIcon size={11} className="inline-block ml-0.5 align-[-0.125em]" />
          </a>
        )
      }
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="italic">{applyHighlight(part.slice(1, -1), hl)}</em>
    }
    return <Fragment key={i}>{applyHighlight(part, hl)}</Fragment>
  })
}

function BulletDot() {
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 mt-[0.55em] w-1.5 h-1.5 rounded-full bg-slate-400"
    />
  )
}

function renderBlock(block: string, idx: number, hl: string): ReactNode {
  const lines = block.split('\n')

  // H3 sub-heading: single line ### Heading
  if (lines.length === 1 && /^###\s+/.test(lines[0])) {
    return (
      <h3 key={idx} className="text-[15px] font-semibold text-slate-800 mt-1">
        {parseInline(lines[0].replace(/^###\s+/, ''), hl)}
      </h3>
    )
  }

  // Bullet list: every line starts with ◦
  if (lines.every(l => /^◦\s+/.test(l))) {
    return (
      <ul key={idx} className="space-y-1 list-none pl-0">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2.5">
            <BulletDot />
            <span className="flex-1 min-w-0">{parseInline(l.replace(/^◦\s+/, ''), hl)}</span>
          </li>
        ))}
      </ul>
    )
  }

  // Ordered list (1. 2. ...) with optional indented ◦ sub-bullets under
  // the most recent numbered item.
  if (/^\d+\.\s+/.test(lines[0] ?? '') && lines.every(l => /^\d+\.\s+/.test(l) || /^\s+◦\s+/.test(l))) {
    const items: { text: string; children: string[] }[] = []
    for (const line of lines) {
      const numbered = line.match(/^\d+\.\s+(.*)$/)
      const sub = line.match(/^\s+◦\s+(.*)$/)
      if (numbered) items.push({ text: numbered[1], children: [] })
      else if (sub && items.length > 0) items[items.length - 1].children.push(sub[1])
    }
    return (
      <ol key={idx} className="space-y-[5px] list-none pl-0">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="flex-shrink-0 text-slate-500 font-medium tabular-nums min-w-[1.25rem]"
            >
              {i + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <div>{parseInline(item.text, hl)}</div>
              {item.children.length > 0 && (
                <ul className="mt-2 space-y-[3px] list-none">
                  {item.children.map((c, j) => (
                    <li key={j} className="flex gap-2.5">
                      <BulletDot />
                      <span className="flex-1 min-w-0">{parseInline(c, hl)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    )
  }

  // Paragraph – soft line breaks preserved.
  return (
    <p key={idx} className="leading-relaxed">
      {lines.map((line, i) => (
        <span key={i}>
          {parseInline(line, hl)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
}

function parseContent(text: string, hl: string): ReactNode {
  return text.split(/\n\n+/).map((block, i) => renderBlock(block, i, hl))
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Outside the component: the React compiler forbids writing to a state value.
function setOffset(card: HTMLElement, transform: string) {
  card.style.transform = transform
}

type Artikel = { steg: { tittel: string; innhold: string }[] }

function stepForQuery(query: string, article: Artikel | undefined): number {
  if (!query || !article) return 0
  const q = toHighlight(query).toLowerCase()
  for (let i = 0; i < article.steg.length; i++) {
    const s = article.steg[i]
    if (`${s.tittel} ${s.innhold}`.toLowerCase().includes(q)) return i
  }
  return 0
}

export function ArticlePage() {
  const publicCategories = use(fetchArticles())
  const categories = useMergedArticles(publicCategories)
  const { kategoriId, artikkelId } = useParams()
  const location = useLocation()

  const searchQuery = (location.state as { query?: string } | null)?.query?.trim() ?? ''

  const category = categories.find(k => k.id === kategoriId)
  const article = category?.artikler.find(a => a.id === artikkelId)

  const [prevLocationKey, setPrevLocationKey] = useState(location.key)
  const [activeStep, setActiveStep] = useState(() => stepForQuery(searchQuery, article))
  const [openImage, setOpenImage] = useState<ArticleImage | null>(null)
  const [highlightActive, setHighlightActive] = useState(!!searchQuery)

  // Reset on a new search to the same URL (location.key differs per entry).
  // State update during render avoids an extra effect cycle.
  if (prevLocationKey !== location.key) {
    setPrevLocationKey(location.key)
    if (searchQuery) {
      setHighlightActive(true)
      setActiveStep(stepForQuery(searchQuery, article))
    }
  }

  const totalSteps = article?.steg.length ?? 0

  // Clear search highlight on the first click anywhere in the document.
  useEffect(() => {
    if (!highlightActive) return
    const handler = () => setHighlightActive(false)
    document.addEventListener('click', handler, { capture: true, once: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [highlightActive])

  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= totalSteps) return
    setActiveStep(idx)
    scrollToTop()
  }

  const [mainEl, setMainEl] = useState<HTMLElement | null>(null)
  const [cardEl, setCardEl] = useState<HTMLElement | null>(null)
  const isDesktop = useFinePointer()
  // The card follows the finger, drags with resistance past the first and
  // last step, and slides out and in from the swipe side on a step change.
  useSwipe(mainEl, {
    onDrag: dx => {
      if (!cardEl || prefersReducedMotion() || cardEl.getAnimations().length) return
      const target = activeStep + (dx < 0 ? 1 : -1)
      const x = target < 0 || target >= totalSteps ? dx * 0.25 : dx
      setOffset(cardEl, `translateX(${x}px)`)
    },
    onRelease: dir => {
      const target = activeStep - dir
      if (!cardEl || prefersReducedMotion()) {
        if (dir) goToStep(target)
        return
      }
      const from = cardEl.style.transform || 'none'
      if (from === 'none') return
      setOffset(cardEl, '')
      if (!dir || target < 0 || target >= totalSteps) {
        cardEl.animate([{ transform: from }, { transform: 'none' }], { duration: 200, easing: 'ease-out' })
        return
      }
      const w = cardEl.offsetWidth
      const out = cardEl.animate(
        [{ transform: from }, { transform: `translateX(${dir * w}px)`, opacity: 0 }],
        { duration: 150, easing: 'ease-in', fill: 'forwards' },
      )
      out.onfinish = () => {
        flushSync(() => goToStep(target))
        out.cancel()
        cardEl.animate(
          [{ transform: `translateX(${-dir * w * 0.3}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 220, easing: 'ease-out' },
        )
      }
    },
  })
  useSwipeHint(cardEl, !isDesktop && activeStep < totalSteps - 1)

  // iOS rubber-banding drags the whole page along with the finger.
  useEffect(() => {
    const root = document.documentElement
    root.style.overscrollBehavior = 'none'
    return () => {
      root.style.overscrollBehavior = ''
    }
  }, [])

  // Arrow keys change step on desktop only; not while typing or in the lightbox.
  const onArrowKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]')) return
    if (e.key === 'ArrowRight') goToStep(activeStep + 1)
    else if (e.key === 'ArrowLeft') goToStep(activeStep - 1)
  })
  useEffect(() => {
    if (!isDesktop || openImage) return
    window.addEventListener('keydown', onArrowKey)
    return () => window.removeEventListener('keydown', onArrowKey)
  }, [isDesktop, openImage])

  if (!article || !category || article.skjult) {
    // Shared links outlive a move to another category.
    const movedTo = categories.find(k => k.artikler.some(a => a.id === artikkelId && !a.skjult))
    return <Navigate to={movedTo ? `/gjor-sann/${movedTo.id}/${artikkelId}` : '/gjor-sann'} replace />
  }

  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === totalSteps - 1
  const step = article.steg[activeStep]
  const hl = highlightActive ? toHighlight(searchQuery) : ''

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator
  const handleShare = () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}gjor-sann/${category.id}/${article.id}`
    navigator.share({ title: article.tittel, text: article.ingress, url }).catch(() => {})
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-x-clip">
      <main ref={setMainEl} className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Title and lede shown only on the first step – gives more room to the
            steps later in the read. The step card below takes over as the main
            visual element. */}
        {isFirstStep && (
          <header className="pt-5 pb-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-lg font-semibold text-slate-800 leading-snug">
                {applyHighlight(article.tittel, hl)}
              </h1>
              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="shrink-0 -mt-1 -mr-1.5 p-1.5 text-slate-500 hover:text-brand-700 transition-colors"
                  aria-label="Del veiledningen"
                >
                  <HeartShareIcon size={18} />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {applyHighlight(article.ingress, hl)}
            </p>
            {article.notat && (
              <p className="text-xs italic text-slate-500 mt-2 leading-relaxed">
                {applyHighlight(article.notat, hl)}
              </p>
            )}
          </header>
        )}

        {/* Step overview (chips) */}
        {/* The chip row scrolls sideways, so it must not change step. */}
        <nav
          aria-label="Steg-oversikt"
          className="flex gap-2 py-4 overflow-x-auto hide-scrollbar"
          data-noswipe
        >
          {article.steg.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToStep(idx)}
              className={`flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-medium transition-all ${
                idx === activeStep
                  ? 'bg-brand-700 text-white shadow-sm'
                  : idx < activeStep
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-white border border-slate-200 text-slate-500'
              }`}
              aria-current={idx === activeStep ? 'step' : undefined}
              aria-label={`Gå til steg ${idx + 1} av ${totalSteps}`}
            >
              {idx + 1}
            </button>
          ))}
        </nav>

        {/* Step content. On touch devices the edge of a card behind it marks
            each side there is a step to swipe to. */}
        <div className="relative mb-4">
          {!isDesktop && !isFirstStep && (
            <div aria-hidden="true" className="absolute inset-y-2 -left-1.5 right-1.5 rounded-2xl border border-slate-200 bg-white" />
          )}
          {!isDesktop && !isLastStep && (
            <div aria-hidden="true" className="absolute inset-y-2 left-1.5 -right-1.5 rounded-2xl border border-slate-200 bg-white" />
          )}
          <div ref={setCardEl} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-brand-50 border-b border-brand-100">
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-0.5">
                Steg {activeStep + 1} av {totalSteps}
              </p>
              <h2 className="text-base font-semibold text-slate-800 leading-snug">
                {applyHighlight(step.tittel, hl)}
              </h2>
            </div>
            <div className="px-4 py-5">
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                {parseContent(step.innhold, hl)}
              </div>
              {step.bilde && (
                <figure className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setOpenImage(step.bilde!)}
                    aria-label={`Åpne bildet i fullskjerm: ${step.bilde.alt}`}
                    className="group relative block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${step.bilde.src}`}
                      alt={step.bilde.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block transition-opacity group-hover:opacity-95"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                    >
                      <ZoomInIcon size={16} />
                    </span>
                  </button>
                  <figcaption className="px-3 py-2 text-xs text-slate-600 leading-snug">
                    {step.bilde.bildetekst}
                    <span className="block text-[11px] text-slate-500 mt-1">{step.bilde.kreditering}</span>
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        </div>

        {isLastStep && (
          <div className="flex justify-end">
            <Link
              to="/gjor-sann"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-green-700 text-white hover:bg-green-800 shadow-sm transition-colors"
            >
              Ferdig
            </Link>
          </div>
        )}

        {/* Related articles (shown on the last step) */}
        {isLastStep && article.relaterte && article.relaterte.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Relaterte veiledninger</h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {article.relaterte.map((relId, idx, arr) => {
                const relCategory = categories.find(k => k.artikler.some(a => a.id === relId))
                const relArticle = relCategory?.artikler.find(a => a.id === relId)
                if (!relArticle || !relCategory || relArticle.skjult) return null
                // Boundary rule: a non-gated article must never expose the
                // existence of a gated article. Filtered out even when the user
                // is unlocked – the lock script enforces this at build time too.
                if (relArticle.laast && !article.laast) return null
                return (
                  <Link
                    key={relId}
                    to={`/gjor-sann/${relCategory.id}/${relId}`}
                    onClick={() => setActiveStep(0)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      idx < arr.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                        {relArticle.laast && (
                          <>
                            <SpyIcon size={13} className="shrink-0 text-slate-400" />
                            <UntestedWarning />
                          </>
                        )}
                        <span>{relArticle.tittel}</span>
                      </p>
                    </div>
                    <ChevronRightIcon size={16} className="text-slate-300" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <ImageLightbox image={openImage} onClose={() => setOpenImage(null)} />
    </div>
  )
}
