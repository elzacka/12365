// Resolves an M365 app's icon path from its Norwegian navn. Lives in /data so
// both FlipCard and CheatSheetRow share the exact same mapping rules.

const SVG_ICONS = new Set(['places'])

export function iconSrc(name: string): string {
  const slug = name.toLowerCase().replace(/ /g, '-')
  const ext = SVG_ICONS.has(slug) ? 'svg' : 'png'
  return `${import.meta.env.BASE_URL}m365-icons/${slug}.${ext}`
}
