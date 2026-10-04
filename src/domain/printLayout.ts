import { LETTER_PAPER } from './paper'
import { templates } from './templates'
import type { Artwork } from './types'

export const PRINT_PAPERS = {
  letter: {
    label: 'US Letter',
    dimensions: '8.5 × 11 in',
    width: LETTER_PAPER.width,
    height: LETTER_PAPER.height,
    cssSize: 'letter',
  },
  a4: {
    label: 'A4',
    dimensions: '210 × 297 mm',
    width: (210 * 72) / 25.4,
    height: (297 * 72) / 25.4,
    cssSize: 'A4',
  },
} as const
export type PrintPaper = keyof typeof PRINT_PAPERS
export interface PrintOptions {
  paper: PrintPaper
  guides: boolean
  ruler: boolean
  instructions: boolean
}
export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  paper: 'letter',
  guides: true,
  ruler: false,
  instructions: true,
}
export const PRINT_MARGIN = 36
const VERTICAL_ART_MARGIN = 60

/** Page coordinates are points (72/inch). Preserve the entire master, including its whitespace. */
export function createPrintLayout(artwork: Artwork, paperId: PrintPaper) {
  const template = templates[artwork.templateId]
  if (template.version !== artwork.templateVersion)
    throw new Error('The fold template does not match this picture.')
  const paper = PRINT_PAPERS[paperId]
  const scale = Math.min(
    (paper.width - 2 * PRINT_MARGIN) / artwork.master.width,
    (paper.height - 2 * VERTICAL_ART_MARGIN) / artwork.master.height,
  )
  const width = artwork.master.width * scale
  const height = artwork.master.height * scale
  const x = (paper.width - width) / 2
  const y = (paper.height - height) / 2
  const mapY = (at: number) => y + at * height
  const folds = template.foldOrder.map((index, step) => {
    const crease = template.creases[index]
    return { ...crease, number: step + 1, y: mapY(crease.at) }
  })
  const bounds = artwork.printBounds
  return {
    paper,
    template,
    scale,
    x,
    y,
    width,
    height,
    folds,
    inkBounds: {
      x: x + bounds.x * width,
      y: mapY(bounds.y),
      width: bounds.width * width,
      height: bounds.height * height,
    },
  }
}

export function formatPrintDistance(points: number) {
  return `${((points * 25.4) / 72).toFixed(1)} mm (${(points / 72).toFixed(2)} in)`
}

export function foldDirection(direction: 'mountain' | 'valley') {
  return direction === 'mountain'
    ? 'Fold the top portion away from you, behind the bottom portion.'
    : 'Bring the top section forward at this crease so its printed side faces you again.'
}
