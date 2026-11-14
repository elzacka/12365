import { describe, it, expect } from 'vitest'
import { keyLabel, parseKeys } from './keys'

const keys = (t: string) => parseKeys(t).flatMap(s => ('key' in s ? [s.key] : []))

describe('parseKeys', () => {
  it.each([
    ['CTRL+SKIFT+M', ['CTRL', 'SKIFT', 'M']],
    ['Windows-tast+PIL VENSTRE', ['Windows-tast', 'PIL VENSTRE']],
    ['Alt, J, S, U, K', ['Alt', 'J', 'S', 'U', 'K']],
    ['ALT+LIKHETSTEGN (=)', ['ALT', 'LIKHETSTEGN (=)']],
    ['DEL eller TILBAKE', ['DEL', 'TILBAKE']],
    ['TABULATOR-tasten', ['TABULATOR-tasten']],
    ['Ctrl+klikk koblingen', ['Ctrl']],
    ['Trykk og hold nede SKIFT mens du merker figurene', ['SKIFT']],
    ['F8, deretter gjentatte ganger F8 for å utvide alt', ['F8', 'F8']],
    ['ESC Hvis både gjeldende felt og gjeldende post er endret', ['ESC']],
    ['CTRL+SKIFT+ampersand (&), s', ['CTRL', 'SKIFT', 'ampersand (&)']],
    ['CTRL+SKIFT+MINDRE enn-tegn (<)', ['CTRL', 'SKIFT', 'MINDRE enn-tegn (<)']],
    ['Spørsmålstegn (?)', ['Spørsmålstegn (?)']],
    ['Sett inn', ['Sett inn']],
    ['?', ['?']],
  ])('%s', (text, expected) => {
    expect(keys(text)).toEqual(expected)
  })

  it('keeps every character of the source text', () => {
    const t = 'ALT+F, T, A, deretter ALT+P. Trykk TAB-tasten til du kommer til knappen'
    expect(parseKeys(t).map(s => ('key' in s ? s.key : s.text)).join('')).toBe(t)
  })
})

describe('keyLabel', () => {
  it.each([
    ['PIL HØYRE', { name: 'Pil høyre', symbol: '→' }],
    ['pil opp', { name: 'Pil opp', symbol: '↑' }],
    ['ALT', { name: 'Alt' }],
    ['CTRL', { name: 'Ctrl' }],
    ['PAGEDOWN', { name: 'Page down' }],
    ['TABULATOR-tasten', { name: 'Tab', symbol: 'tab' }],
    ['Windows-logotasten', { name: 'Windows-tast', symbol: 'windows' }],
    ['LIKHETSTEGN (=)', { name: 'Likhetstegn', symbol: '=' }],
    ['f5', { name: 'F5' }],
  ])('%s', (raw, expected) => {
    expect(keyLabel(raw)).toEqual(expected)
  })
})
