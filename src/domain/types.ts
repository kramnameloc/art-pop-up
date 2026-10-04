export type TemplateId = 'surprise' | 'thirds'
export type PaperState = 'closed' | 'opening' | 'open' | 'closing'

/** All geometry is normalized to the unfolded sheet, with y increasing downward. */
export interface FoldPanel {
  id: string
  from: number
  to: number
  closedOrigin: number
  closedDirection: 1 | -1
  closedFace: 'front' | 'back'
  layer: number
}

export interface VisibleRegion {
  from: number
  to: number
  /** Top position within the closed sheet, not the unfolded sheet. */
  at: number
}

export interface FoldTemplate {
  id: TemplateId
  version: 1
  name: string
  description: string
  physicalStatus: 'unverified'
  aspectRatio: number
  closedHeight: number
  creases: { at: number; direction: 'mountain' | 'valley' }[]
  /** Indices into creases, in the order a person should fold the printed sheet. */
  foldOrder: number[]
  printCheck: string
  panels: FoldPanel[]
  closedVisible: VisibleRegion[]
  bands: { from: number; to: number; label: string; color: string }[]
  instructions: string[]
}

export interface Artwork {
  id: string
  title: string
  subtitle: string
  palette: 'peach' | 'lavender' | 'sage'
  templateId: TemplateId
  templateVersion: 1
  reviewStatus: 'approved-demo'
  master: { kind: 'svg'; src: string } & Pick<typeof LETTER_PAPER, 'width' | 'height'>
  thumbnail: string
  descriptions: Record<'closed' | 'open', string>
  review: { visual: 'agent-reviewed'; human: 'pending'; physical: 'pending'; notes: string }
  printBounds: { x: number; y: number; width: number; height: number }
}
import type { LETTER_PAPER } from './paper'
