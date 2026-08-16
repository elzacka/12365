export function SearchShortcutHint() {
  return (
    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
      <kbd className="text-[10px] font-medium text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50">
        Ctrl+K
      </kbd>
    </div>
  )
}
