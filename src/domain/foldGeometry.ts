import type { FoldTemplate } from './types'

export function clampProgress(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

/** Orthographic projection of connected rigid panels. The base never rotates. */
export function foldGeometry(template: FoldTemplate, value: number) {
  const progress = clampProgress(value)
  const [top, hinge, base] = template.panels
  const angle = Math.PI * (1 - progress)
  const length = hinge.to - hinge.from
  const hingeY = base.from - length * Math.cos(angle)
  const topY = hingeY - (top.to - top.from)
  const lift = length * Math.sin(angle)
  return {
    height: 1 - topY,
    panels: [
      { panel: top, y: 0, z: lift, angle: 0 },
      { panel: hinge, y: hingeY - topY, z: lift, angle: -(1 - progress) * 180 },
      { panel: base, y: base.from - topY, z: 0, angle: 0 },
    ],
  }
}
