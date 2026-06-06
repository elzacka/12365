// Resolves an M365 app's icon path from its Norwegian navn. Lives in /data so
// both FlipCard and CheatSheetRow share the exact same mapping rules.

const SVG_ICONS = new Set(['places', 'copilot'])

// Card names that don't map to their slug by simple lowercase + hyphen.
const NAME_TO_SLUG: Record<string, string> = {
  'microsoft 365 copilot': 'copilot',
}

export function iconSrc(name: string): string {
  const key = name.toLowerCase()
  const slug = NAME_TO_SLUG[key] ?? key.replace(/ /g, '-')
  const ext = SVG_ICONS.has(slug) ? 'svg' : 'png'
  return `${import.meta.env.BASE_URL}m365-icons/${slug}.${ext}`
}
