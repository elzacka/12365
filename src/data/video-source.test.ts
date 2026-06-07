import { describe, it, expect } from 'vitest'
import { parseVideoSource } from './video-source'

describe('parseVideoSource', () => {
  it('parses youtube.com/watch URLs', () => {
    const result = parseVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '/12365/')
    expect(result.type).toBe('youtube')
    if (result.type !== 'youtube') return
    expect(result.embedSrc).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('parses youtu.be short URLs', () => {
    const result = parseVideoSource('https://youtu.be/dQw4w9WgXcQ', '/12365/')
    expect(result.type).toBe('youtube')
  })

  it('parses vimeo URLs', () => {
    const result = parseVideoSource('https://vimeo.com/123456789', '/12365/')
    expect(result.type).toBe('vimeo')
    if (result.type !== 'vimeo') return
    expect(result.embedSrc).toContain('player.vimeo.com/video/123456789')
    expect(result.embedSrc).toContain('dnt=1')
  })

  it('parses Canva smart embed links', () => {
    const result = parseVideoSource(
      'https://www.canva.com/design/DAHL0POPcfg/OYzxLeZtgs-db2SUlA-aUQ/watch',
      '/12365/',
    )
    expect(result.type).toBe('canva')
    if (result.type !== 'canva') return
    expect(result.embedSrc).toBe(
      'https://www.canva.com/design/DAHL0POPcfg/OYzxLeZtgs-db2SUlA-aUQ/watch?embed',
    )
  })

  it('treats relative paths as local files prefixed with base', () => {
    const result = parseVideoSource('videos/intro.mp4', '/12365/')
    expect(result.type).toBe('file')
    if (result.type !== 'file') return
    expect(result.src).toBe('/12365/videos/intro.mp4')
  })

  it('keeps absolute non-streaming URLs as-is', () => {
    const result = parseVideoSource('https://example.com/clip.mp4', '/12365/')
    expect(result.type).toBe('file')
    if (result.type !== 'file') return
    expect(result.src).toBe('https://example.com/clip.mp4')
  })
})
