import { useState, use, type ReactNode } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { fetchArticles } from '../data/loader'
import { useMergedArticles } from '../auth/merge'
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, ZoomInIcon } from '../components/Icons'
import { CopyableCommand } from '../components/CopyableCommand'
import { ImageLightbox } from '../components/ImageLightbox'
import type { ArticleImage } from '../types'

// Block-aware markdown-to-JSX. The step content is split into blocks on
// blank lines; each block renders as paragraph, sub-heading (###), bullet
// list (◦) or numbered list (1.) with optional indented sub-bullets.
// Backtick `cmd` marks copy-paste commands, [tekst](url) becomes external
// links. Kept intentionally small – only the syntax actually used in
// articles.json is supported.

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/)
  return parts.map((part, i): ReactNode => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
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
            {label}
            <ExternalLinkIcon size={11} className="inline-block ml-0.5 align-[-0.125em]" />
          </a>
        )
      }
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    }
    return part
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

function renderBlock(block: string, idx: number): ReactNode {
  const lines = block.split('\n')

  // H3 sub-heading: single line ### Heading
  if (lines.length === 1 && /^###\s+/.test(lines[0])) {
    return (
      <h3 key={idx} className="text-[15px] font-semibold text-slate-800 mt-1">
        {parseInline(lines[0].replace(/^###\s+/, ''))}
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
            <span className="flex-1 min-w-0">{parseInline(l.replace(/^◦\s+/, ''))}</span>
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
              <div>{parseInline(item.text)}</div>
              {item.children.length > 0 && (
                <ul className="mt-2 space-y-[3px] list-none">
                  {item.children.map((c, j) => (
                    <li key={j} className="flex gap-2.5">
                      <BulletDot />
                      <span className="flex-1 min-w-0">{parseInline(c)}</span>
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
          {parseInline(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
}

function parseContent(text: string): ReactNode {
  return text.split(/\n\n+/).map((block, i) => renderBlock(block, i))
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function ArticlePage() {
  const publicCategories = use(fetchArticles())
  const categories = useMergedArticles(publicCategories)
  const { kategoriId, artikkelId } = useParams()
  const [activeStep, setActiveStep] = useState(0)
  const [openImage, setOpenImage] = useState<ArticleImage | null>(null)

  const category = categories.find(k => k.id === kategoriId)
  const article = category?.artikler.find(a => a.id === artikkelId)
  const totalSteps = article?.steg.length ?? 0

  const goPrevious = () => {
    setActiveStep(s => Math.max(0, s - 1))
    scrollToTop()
  }

  const goNext = () => {
    setActiveStep(s => Math.min(totalSteps - 1, s + 1))
    scrollToTop()
  }

  const goToStep = (idx: number) => {
    setActiveStep(idx)
    scrollToTop()
  }

  if (!article || !category || article.skjult) {
    return <Navigate to="/slik-gjor-du" replace />
  }

  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === totalSteps - 1
  const progress = ((activeStep + 1) / totalSteps) * 100
  const step = article.steg[activeStep]

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Progress bar at the top – visual anchor without competing for focus. */}
      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-brand-700 transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={activeStep + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Fremdrift: steg ${activeStep + 1} av ${totalSteps}`}
        />
      </div>

      <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Title and lede shown only on the first step – gives more room to the
            steps later in the read. The step card below takes over as the main
            visual element. */}
        {isFirstStep && (
          <header className="pt-5 pb-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {category.tittel}
            </p>
            <h1 className="text-lg font-semibold text-slate-800 leading-snug mt-1">
              {article.tittel}
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{article.ingress}</p>
            {article.oppdatert && (
              <p className="text-xs italic text-slate-400 mt-2 leading-relaxed">{article.oppdatert}</p>
            )}
            {article.notat && (
              <p className="text-xs italic text-slate-500 mt-2 leading-relaxed">{article.notat}</p>
            )}
          </header>
        )}

        {/* Step overview (chips) */}
        <nav aria-label="Steg-oversikt" className="flex gap-2 py-4 overflow-x-auto hide-scrollbar">
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
              aria-label={`Gå til steg ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </nav>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 bg-brand-50 border-b border-brand-100">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-0.5">
              Steg {activeStep + 1} av {totalSteps}
            </p>
            <h2 className="text-base font-semibold text-slate-800 leading-snug">{step.tittel}</h2>
          </div>
          <div className="px-4 py-5">
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              {parseContent(step.innhold)}
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

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={goPrevious}
            disabled={isFirstStep}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isFirstStep
                ? 'text-slate-300 bg-white border border-slate-100 cursor-not-allowed'
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
            aria-label="Forrige steg"
          >
            <ChevronLeftIcon size={18} />
            Forrige
          </button>

          <div className="flex-1 text-center">
            <span className="text-xs text-slate-500">
              {activeStep + 1} / {totalSteps}
            </span>
          </div>

          {isLastStep ? (
            <Link
              to="/slik-gjor-du"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 shadow-sm transition-colors"
            >
              Ferdig
            </Link>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 shadow-sm transition-colors"
              aria-label="Neste steg"
            >
              Neste
              <ChevronRightIcon size={18} />
            </button>
          )}
        </div>

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
                    to={`/slik-gjor-du/${relCategory.id}/${relId}`}
                    onClick={() => setActiveStep(0)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      idx < arr.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{relArticle.tittel}</p>
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
