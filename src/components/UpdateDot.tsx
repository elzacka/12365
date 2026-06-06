interface UpdateDotProps {
  visible: boolean
  className?: string
}

// Subtle "ny eller endret"-prikk. The lighter brand-300 keeps the cue
// recognisable without competing for attention against the rest of the UI.
export function UpdateDot({ visible, className }: UpdateDotProps) {
  if (!visible) return null
  return (
    <span
      role="status"
      aria-label="Nytt eller endret innhold"
      className={`inline-block w-1.5 h-1.5 rounded-full bg-brand-200 ${className ?? ''}`}
    />
  )
}
