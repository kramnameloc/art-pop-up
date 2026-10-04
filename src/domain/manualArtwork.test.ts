import { describe, expect, it } from 'vitest'
import { buildArtworkPrompt, svgImageUrl } from './manualArtwork'
import { assetUrl } from './artworkRepository'

describe('manual SVG prompt', () => {
  it('includes the idea and the surprise-fold contract, distinguishing seams from creases', () => {
    const prompt = buildArtworkPrompt('  A teapot full of friendly mice.  ')
    expect(prompt).toContain('A teapot full of friendly mice.')
    expect(prompt).toContain('viewBox="0 0 612 792"')
    expect(prompt).toContain('y=198 joins y=594')
    expect(prompt).toContain('y=396 (mountain)')
    expect(prompt).toContain('y=594 is a visibility boundary, NOT another crease')
    expect(prompt).toContain('closed picture is 612 × 396')
    expect(prompt).toContain(
      'ENTIRE SVG document inside exactly ONE fenced Markdown code block labeled svg',
    )
    expect(prompt).toContain('first response line must be ```svg')
    expect(prompt).toContain('No SVG or explanation outside it')
    expect(prompt).toContain('Coco Wyo-inspired')
    expect(prompt).toContain('Refine weak or rough parts')
  })
  it('preserves SVG Unicode and local references without resolving them as app asset paths', () => {
    const svg = '<svg><title>Étoile 🌟</title><path fill="url(#star)"/></svg>'
    const url = svgImageUrl(svg)
    expect(assetUrl(url)).toBe(url)
    expect(decodeURIComponent(url.split(',')[1])).toBe(svg)
  })
})
