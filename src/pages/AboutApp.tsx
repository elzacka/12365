import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import aboutAppContent from '../../OM-APPEN.md?raw'
import { Markdown } from '../lib/markdown'
import { useSeenVersions } from '../lib/SeenVersionsContext'

export function AboutApp() {
  const { markAboutSeen } = useSeenVersions()
  useEffect(() => {
    markAboutSeen()
  }, [markAboutSeen])

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-6 pb-10 max-w-2xl mx-auto w-full">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-6">
          <Markdown source={aboutAppContent} />
        </article>

        <nav className="mt-4 grid grid-cols-2 gap-3" aria-label="Mer informasjon">
          <a
            href="https://github.com/elzacka/12365"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            Appens kildekode
          </a>
          <Link
            to="/personvern"
            className="flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            Personvern
          </Link>
        </nav>
      </main>
    </div>
  )
}
