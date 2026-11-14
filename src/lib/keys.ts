// Splits Microsoft's key text (nb-no) into keys and the words between them.

// Unambiguous key names, any case.
const SURE = String.raw`fn|windows-menytasten|windows-(?:logo)?tast(?:en)?|pil ?(?:opp|ned|venstre|høyre)(?:-tasten)?|piltast(?:ene|er)?|ctrl|alt gr|skift|shift|escape|esc|enter|tabulator-?tasten|tabulator|tab-tasten|tab|mellomromstasten|mellomrom|backspace|pgup|pgdn|page ?up|page ?down|f1[0-2]|f[1-9]|caps lock|menytasten|print screen|prtscn`
// Words that are also ordinary Norwegian: a key only in capitals, next to «+» or first in the text.
const MAYBE = String.raw`alt|del|delete|slett|end|home|tilbake(?:tasten)?|insert`
const TOKEN = new RegExp(String.raw`(?<![\p{L}\d])(?:(${SURE})|(${MAYBE})|([\p{L}-]+(?: [\p{L}-]+)* \(.{1,3}\))|(\p{Lu}|\d))(?![\p{L}\d])`, 'giu')

type Segment = { key: string } | { text: string }

/** Microsoft's key text as keys and the words between them. */
export function parseKeys(text: string): Segment[] {
  // A whole text that is one key: «?», «Hjem», «Sett inn».
  if (/^(\S|hjem|sett inn|slette)$/i.test(text)) return [{ key: text }]
  const out: Segment[] = []
  const re = new RegExp(TOKEN)
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const [whole, sure, maybe, charName, single] = m
    const start = m.index
    const before = text.slice(0, start).trimEnd()
    const after = text.slice(start + whole.length).trimStart()
    const joined = before.endsWith('+') || after.startsWith('+')
    const ok = sure
      || (maybe && (joined || before === '' || maybe === maybe.toUpperCase()))
      || (charName && (before === '' || before.endsWith('+')))
      // «Alt, J, S» and «S, 1»: a lone capital or digit between separators.
      || (single && single === single.toUpperCase()
        && (joined || /(^|,|eller|og)$/.test(before) && /^($|,|\+|eller\b|og\b|\(|\))/.test(after)))
    // A rejected match may hide a key inside it: retry one character later.
    if (!ok) { re.lastIndex = start + 1; continue }
    if (start > last) out.push({ text: text.slice(last, start) })
    out.push({ key: whole })
    last = start + whole.length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

export interface KeyLabel {
  /** Text on the key, or what a screen reader says for a symbol. */
  name: string
  /** ISO/IEC 9995-7 symbol as Nordic keyboards print it; «windows» and «tab» are icons. */
  symbol?: string
  unknown?: true
}

const ARROWS: Record<string, string> = { opp: '↑', ned: '↓', venstre: '←', høyre: '→' }

// Text keys: capital first letter, the rest lower case.
const NAMED: Record<string, string> = {
  fn: 'Fn', ctrl: 'Ctrl', alt: 'Alt', 'alt gr': 'Alt gr', esc: 'Esc', escape: 'Esc', mellomrom: 'Mellomrom', mellomroms: 'Mellomrom',
  del: 'Delete', delete: 'Delete', slett: 'Delete', slette: 'Delete', tilbake: 'Backspace', backspace: 'Backspace',
  home: 'Home', hjem: 'Home', end: 'End', insert: 'Insert', 'sett inn': 'Insert',
  pgup: 'Page up', 'page up': 'Page up', pageup: 'Page up', pgdn: 'Page down', 'page down': 'Page down', pagedown: 'Page down',
  'caps lock': 'Caps lock', 'print screen': 'Print screen', prtscn: 'Print screen', meny: 'Menytast', 'windows-meny': 'Menytast',
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('nb') + s.slice(1).toLocaleLowerCase('nb')

export function keyLabel(raw: string): KeyLabel {
  const k = raw.toLowerCase().replace(/-?tasten$/, '').trim()
  if (NAMED[k]) return { name: NAMED[k] }
  if (/^windows/.test(k)) return { name: 'Windows-tast', symbol: 'windows' }
  if (k === 'skift' || k === 'shift') return { name: 'Skift', symbol: '⇧' }
  if (k === 'enter') return { name: 'Enter', symbol: '↵' }
  if (/^tab(ulator)?$/.test(k)) return { name: 'Tab', symbol: 'tab' }
  const arrow = k.match(/^pil ?(opp|ned|venstre|høyre)$/)
  if (arrow) return { name: `Pil ${arrow[1]}`, symbol: ARROWS[arrow[1]] }
  if (/^piltast(ene|er)?$/.test(k)) return { name: 'Piltastene', symbol: '← → ↑ ↓' }
  const char = raw.match(/^(.*?)\s*\((.{1,3})\)$/)
  if (char) return { name: capitalize(char[1]), symbol: char[2].trim() }
  if (/^(\S|f\d{1,2})$/.test(k)) return { name: raw.toUpperCase() }
  return { name: raw, unknown: true }
}
