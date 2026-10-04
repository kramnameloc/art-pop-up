import { describe, expect, it } from 'vitest'
import manifest from '../../public/artworks/manifest.json'
import { parseArtworkManifest } from './artworkRepository'
import { createPrintLayout, formatPrintDistance, PRINT_MARGIN, PRINT_PAPERS } from './printLayout'

describe('physical print layout', () => {
  for (const paper of ['letter', 'a4'] as const) {
    for (const artwork of parseArtworkManifest(manifest)) {
      it(`${artwork.id} on ${paper}: fits, centers, and registers after both folds`, () => {
        const layout = createPrintLayout(artwork, paper)
        expect(layout.width / layout.height).toBeCloseTo(8.5 / 11, 10)
        expect(layout.x).toBeGreaterThanOrEqual(PRINT_MARGIN)
        expect(layout.y).toBeGreaterThanOrEqual(PRINT_MARGIN)
        expect(layout.x + layout.width / 2).toBeCloseTo(layout.paper.width / 2)
        expect(layout.y + layout.height / 2).toBeCloseTo(layout.paper.height / 2)
        const { inkBounds: ink } = layout
        expect(ink.x).toBeGreaterThanOrEqual(PRINT_MARGIN)
        expect(ink.y).toBeGreaterThanOrEqual(PRINT_MARGIN)
        expect(ink.x + ink.width).toBeLessThanOrEqual(layout.paper.width - PRINT_MARGIN)
        expect(ink.y + ink.height).toBeLessThanOrEqual(layout.paper.height - PRINT_MARGIN)
        // Reflect the top-quarter seam across the first crease, then the folded second crease.
        // The seam at that second crease must meet the original bottom-quarter seam.
        const first = layout.folds[0]
        const second = layout.folds[1]
        expect(first.direction).toBe('mountain')
        expect(second.direction).toBe('valley')
        expect(2 * first.y - second.y).toBeCloseTo(layout.y + layout.height * 0.75, 10)
        // Detect the common error of folding the physical sheet at 25% after margin fitting.
        expect(second.y).not.toBeCloseTo(layout.paper.height * 0.25, 1)
      })
    }
  }
  it('uses real paper units, with directions measured from the physical page edge', () => {
    expect(PRINT_PAPERS.letter.width / 72).toBe(8.5)
    expect(PRINT_PAPERS.letter.height / 72).toBe(11)
    expect((PRINT_PAPERS.a4.width * 25.4) / 72).toBeCloseTo(210, 10)
    expect((PRINT_PAPERS.a4.height * 25.4) / 72).toBeCloseTo(297, 10)
    const artwork = parseArtworkManifest(manifest)[0]
    expect(
      createPrintLayout(artwork, 'letter').folds.map(({ y }) => formatPrintDistance(y)),
    ).toEqual(['139.7 mm (5.50 in)', '80.4 mm (3.17 in)'])
  })
})
