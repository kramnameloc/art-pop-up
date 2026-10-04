import { describe, expect, it } from 'vitest'
import { clampProgress, foldGeometry } from './foldGeometry'
import { templates } from './templates'

// Verify world-space panel edges and orientation independently of DOM styling.
describe('continuous folding', () => {
  it.each(Object.values(templates))(
    '$name keeps physical panel edges connected throughout the fold',
    (template) => {
      for (let step = 0; step <= 100; step++) {
        const geometry = foldGeometry(template, step / 100)
        expect(geometry.height).toBeGreaterThanOrEqual(template.closedHeight - 1e-10)
        expect(geometry.height).toBeLessThanOrEqual(1)
        geometry.panels.slice(0, -1).forEach((surface, index) => {
          const angle = (surface.angle * Math.PI) / 180
          const length = surface.panel.to - surface.panel.from
          const next = geometry.panels[index + 1]
          expect(surface.y + length * Math.cos(angle)).toBeCloseTo(next.y)
          expect(surface.z + length * Math.sin(angle)).toBeCloseTo(next.z)
        })
      }
    },
  )
  it('preserves the full sheet and the expected closed footprint', () => {
    const template = templates.surprise
    expect(foldGeometry(template, 0).height).toBe(0.5)
    expect(foldGeometry(template, 1).height).toBe(1)
    expect(foldGeometry(template, 0).panels[1].angle).toBe(-180)
    expect(foldGeometry(template, 0.5).panels[1].angle).toBe(-90)
    expect(foldGeometry(template, 1).panels.every((surface) => surface.angle === 0)).toBe(true)
  })
  it('clamps overshoots and invalid pointer values', () => {
    expect([-3, 0, 0.3, 1, 9, NaN, Infinity].map(clampProgress)).toEqual([0, 0, 0.3, 1, 1, 0, 0])
  })
})
