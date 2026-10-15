import { Link } from 'react-router-dom'

// Styled like the header title. No underline: a breadcrumb in a nav is identifiable as a link by position.
export function Breadcrumb({ parentTo, parentLabel, current }: { parentTo: string; parentLabel: string; current?: string }) {
  return (
    <nav aria-label="Brødsmulesti" className="min-w-0">
      <ol className="flex items-center gap-x-1.5 text-base font-semibold text-slate-800 whitespace-nowrap">
        <li className="shrink-0">
          <Link to={parentTo} className="text-slate-500 hover:text-brand-700 transition-colors">
            {parentLabel}
          </Link>
        </li>
        {current && (
          <li className="flex items-center gap-1.5 min-w-0">
            <span aria-hidden="true" className="text-slate-400">›</span>
            <span className="truncate" aria-current="page">{current}</span>
          </li>
        )}
      </ol>
    </nav>
  )
}
