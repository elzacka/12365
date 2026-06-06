export type AppsView = 'kort' | 'oversikt'

interface ViewToggleProps {
  value: AppsView
  onChange: (value: AppsView) => void
}

const OPTIONS: { value: AppsView; label: string }[] = [
  { value: 'kort', label: 'Snu-kort' },
  { value: 'oversikt', label: 'Oversikt' },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Visning av apper"
      className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200"
    >
      {OPTIONS.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              active
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
