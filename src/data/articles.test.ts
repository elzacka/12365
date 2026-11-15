import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import type { ArticleCategory } from '../types'

const categories = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/content/articles.json'), 'utf8'),
) as ArticleCategory[]

describe('articles.json', () => {
  // The article parser renders a «◦» list only when every line of the block is a bullet.
  it('has a blank line between a bullet list and the text before it', () => {
    const broken = categories.flatMap(c => c.artikler.flatMap(a => a.steg.flatMap((s, i) =>
      s.innhold.split(/\n\n+/)
        .map(block => block.split('\n'))
        .filter(lines => /^◦\s/.test(lines[1] ?? '') && !/^(◦|\d+\.)\s/.test(lines[0]))
        .map(lines => `${a.id} steg ${i + 1}: ${lines[0].slice(0, 40)}`),
    )))
    expect(broken).toEqual([])
  })
})
