import type { FoldTemplate, TemplateId } from './types'
import { LETTER_PAPER } from './paper'

export const templates: Record<TemplateId, FoldTemplate> = {
  surprise: {
    id: 'surprise',
    version: 1,
    name: 'Surprise fold',
    description: 'The top and bottom meet. A big middle stays tucked away.',
    physicalStatus: 'unverified',
    aspectRatio: LETTER_PAPER.width / LETTER_PAPER.height,
    closedHeight: 0.5,
    creases: [
      { at: 0.25, direction: 'valley' },
      { at: 0.5, direction: 'mountain' },
    ],
    panels: [
      {
        id: 'top',
        from: 0,
        to: 0.25,
        closedOrigin: 0.5,
        closedDirection: 1,
        closedFace: 'front',
        layer: 2,
      },
      {
        id: 'hinge',
        from: 0.25,
        to: 0.5,
        closedOrigin: 0.75,
        closedDirection: -1,
        closedFace: 'back',
        layer: 1,
      },
      {
        id: 'base',
        from: 0.5,
        to: 1,
        closedOrigin: 0.5,
        closedDirection: 1,
        closedFace: 'front',
        layer: 0,
      },
    ],
    closedVisible: [
      { from: 0, to: 0.25, at: 0 },
      { from: 0.75, to: 1, at: 0.25 },
    ],
    bands: [
      { from: 0, to: 0.25, label: '1', color: '#f7e6b6' },
      { from: 0.25, to: 0.5, label: '2', color: '#eedfef' },
      { from: 0.5, to: 0.75, label: '3', color: '#dcebe2' },
      { from: 0.75, to: 1, label: '4', color: '#f6d8cd' },
    ],
    instructions: [
      'Start with the numbers facing you and band 1 at the top.',
      'At the halfway line, fold the top half behind the bottom half.',
      'Fold band 1 forward along the quarter line so its number faces you again.',
      'Bands 1 and 4 should be visible together. Bands 2 and 3 should be hidden.',
      'Pull the top edge up to unfold. Record whether the seam markers meet.',
    ],
  },
  thirds: {
    id: 'thirds',
    version: 1,
    name: 'Equal thirds',
    description: 'Three equal panels stack together. Only the top panel shows.',
    physicalStatus: 'unverified',
    aspectRatio: LETTER_PAPER.width / LETTER_PAPER.height,
    closedHeight: 1 / 3,
    creases: [
      { at: 1 / 3, direction: 'valley' },
      { at: 2 / 3, direction: 'mountain' },
    ],
    panels: [
      {
        id: 'top',
        from: 0,
        to: 1 / 3,
        closedOrigin: 2 / 3,
        closedDirection: 1,
        closedFace: 'front',
        layer: 2,
      },
      {
        id: 'hinge',
        from: 1 / 3,
        to: 2 / 3,
        closedOrigin: 1,
        closedDirection: -1,
        closedFace: 'back',
        layer: 1,
      },
      {
        id: 'base',
        from: 2 / 3,
        to: 1,
        closedOrigin: 2 / 3,
        closedDirection: 1,
        closedFace: 'front',
        layer: 0,
      },
    ],
    closedVisible: [{ from: 0, to: 1 / 3, at: 0 }],
    bands: [
      { from: 0, to: 1 / 3, label: '1', color: '#f7e6b6' },
      { from: 1 / 3, to: 2 / 3, label: '2', color: '#eedfef' },
      { from: 2 / 3, to: 1, label: '3', color: '#dcebe2' },
    ],
    instructions: [
      'Start with the numbers facing you and band 1 at the top.',
      'At the lower crease, fold the upper two panels behind the bottom panel.',
      'Fold band 1 forward at the upper crease, until it faces you again.',
      'All three panels should stack. Only band 1 should be visible from the front.',
      'Unfold and compare with the surprise fold. Record the visible bands.',
    ],
  },
}

/** These endpoint projections are the phase 1 contract, not a 3D animation. */
export function visibleRegions(template: FoldTemplate, open: boolean) {
  return open ? [{ from: 0, to: 1, at: 0 }] : template.closedVisible
}

export function createPrototypeSvg(template: FoldTemplate): string {
  const { width, height } = LETTER_PAPER
  const bands = template.bands
    .map((band) => {
      const y = band.from * height
      const bandHeight = (band.to - band.from) * height
      return `<rect x="0" y="${y}" width="${width}" height="${bandHeight}" fill="${band.color}"/><text x="${width / 2}" y="${y + bandHeight / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="70" fill="#293d35">${band.label}</text>`
    })
    .join('')
  const creases = template.creases
    .map(
      (crease) =>
        `<path d="M0 ${crease.at * height}H${width}" stroke="#293d35" stroke-width="2" stroke-dasharray="10 6"/><text x="24" y="${crease.at * height - 12}" font-family="sans-serif" font-size="13">${crease.direction} fold · ${(crease.at * 100).toFixed(1)}%</text>`,
    )
    .join('')
  const markers =
    template.id === 'surprise'
      ? [0.25, 0.75]
          .flatMap((y) =>
            [0.15, 0.85].map(
              (x) =>
                `<path d="M${x * width} ${y * height - 22}v44m-14-22h28" stroke="#293d35" stroke-width="3"/>`,
            ),
          )
          .join('')
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="8.5in" height="11in" viewBox="0 0 ${width} ${height}"><title>${template.name} numbered US Letter prototype</title>${bands}${creases}${markers}<rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#293d35" stroke-width="2"/><text x="${width / 2}" y="28" text-anchor="middle" font-family="sans-serif" font-size="14">TOP · ${template.name} v${template.version} · US Letter</text><text x="${width / 2}" y="${height - 28}" text-anchor="middle" font-family="sans-serif" font-size="12">Prototype only · physical verification pending</text></svg>`
}
