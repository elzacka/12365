import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Markdown } from './markdown'

function renderMarkdown(source: string) {
  return render(
    <MemoryRouter>
      <Markdown source={source} />
    </MemoryRouter>
  )
}

describe('Markdown', () => {
  it('renders headings at levels 1-4', () => {
    renderMarkdown('# H1\n\n## H2\n\n### H3\n\n#### H4')
    expect(screen.getByRole('heading', { level: 1, name: 'H1' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: 'H2' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'H3' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 4, name: 'H4' })).toBeDefined()
  })

  it('renders bold and italic inline', () => {
    const { container } = renderMarkdown('Dette er **fett** og *kursiv*.')
    expect(container.querySelector('strong')?.textContent).toBe('fett')
    expect(container.querySelector('em')?.textContent).toBe('kursiv')
  })

  it('renders an unordered list', () => {
    renderMarkdown('- en\n- to\n- tre')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('en')
  })

  it('renders an ordered list', () => {
    const { container } = renderMarkdown('1. en\n2. to')
    expect(container.querySelector('ol')).not.toBeNull()
    expect(container.querySelectorAll('li')).toHaveLength(2)
  })

  it('renders external links with target=_blank and rel=noopener', () => {
    const { container } = renderMarkdown('[Microsoft](https://microsoft.com)')
    const a = container.querySelector('a')
    expect(a?.getAttribute('href')).toBe('https://microsoft.com')
    expect(a?.getAttribute('target')).toBe('_blank')
    expect(a?.getAttribute('rel')).toContain('noopener')
  })

  it('renders internal /paths as React Router links without target', () => {
    const { container } = renderMarkdown('[Personvern](/personvern)')
    const a = container.querySelector('a')
    expect(a?.getAttribute('href')).toBe('/personvern')
    expect(a?.getAttribute('target')).toBeNull()
  })

  it('keeps single line breaks inside a paragraph', () => {
    const { container } = renderMarkdown('linje 1\nlinje 2')
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })
})
