import { describe, expect, it } from 'vitest'
import { createPrototypeSvg, templates, visibleRegions } from './templates'
import { LETTER_PAPER } from './paper'

describe('fold surface contract', () => {
  it('uses exact US Letter proportions for all templates', () => {
    expect(LETTER_PAPER.width / LETTER_PAPER.height).toBe(8.5 / 11)
    Object.values(templates).forEach((template) => expect(template.aspectRatio).toBe(8.5 / 11))
  })
  for (const template of Object.values(templates)) {
    it(`${template.name}: panels remain connected and cover the open sheet`, () => {
      expect(template.panels[0].from).toBe(0)
      expect(template.panels.at(-1)?.to).toBe(1)
      template.panels.slice(0, -1).forEach((panel, index) => {
        const next = template.panels[index + 1]
        expect(panel.to).toBeCloseTo(next.from)
        expect(panel.closedOrigin + (panel.to - panel.from) * panel.closedDirection).toBeCloseTo(
          next.closedOrigin,
        )
      })
      expect(visibleRegions(template, true)).toEqual([{ from: 0, to: 1, at: 0 }])
    })

    it(`${template.name}: visible artwork matches physical panel occlusion`, () => {
      const minY = Math.min(
        ...template.panels.flatMap((panel) => [
          panel.closedOrigin,
          panel.closedOrigin + (panel.to - panel.from) * panel.closedDirection,
        ]),
      )
      // Independently ray-cast through stacked panels, rather than copying the visible-region map.
      for (let sample = 0; sample < 100; sample++) {
        const localY = ((sample + 0.5) / 100) * template.closedHeight
        const worldY = minY + localY
        const covering = template.panels
          .filter((panel) => {
            const end = panel.closedOrigin + (panel.to - panel.from) * panel.closedDirection
            return (
              worldY >= Math.min(panel.closedOrigin, end) &&
              worldY < Math.max(panel.closedOrigin, end)
            )
          })
          .sort((a, b) => b.layer - a.layer)
        const front = covering[0]
        expect(front.closedFace).toBe('front')
        const sourceY = front.from + (worldY - front.closedOrigin) * front.closedDirection
        const region = template.closedVisible.find(
          (item) => localY >= item.at && localY < item.at + item.to - item.from,
        )
        expect(region).toBeDefined()
        expect(region!.from + localY - region!.at).toBeCloseTo(sourceY)
      }
    })

    it(`${template.name}: downloadable guides use the same crease coordinates`, () => {
      const svg = createPrototypeSvg(template)
      expect(svg).toContain('width="8.5in" height="11in"')
      expect(svg).toContain('viewBox="0 0 612 792"')
      template.creases.forEach((crease) =>
        expect(svg).toContain(`M0 ${crease.at * LETTER_PAPER.height}H${LETTER_PAPER.width}`),
      )
      expect(svg).toContain('physical verification pending')
    })
  }
})
