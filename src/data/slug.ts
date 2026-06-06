export function slugify(navn: string): string {
  return navn.toLowerCase().replace(/\s+/g, '-')
}
