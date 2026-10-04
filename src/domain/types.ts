export type Concept = 'cooler' | 'gift' | 'garden'
export type TemplateId = 'surprise' | 'thirds'
export type PaperState = 'closed' | 'open'

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
  panels: FoldPanel[]
  closedVisible: VisibleRegion[]
  bands: { from: number; to: number; label: string; color: string }[]
  instructions: string[]
}

export interface Artwork {
  id: string
  title: string
  subtitle: string
  concept: Concept
  palette: 'peach' | 'lavender' | 'sage'
  templateId: TemplateId
  templateVersion: 1
  reviewStatus: 'approved-placeholder'
  master: { kind: 'concept-placeholder' } & Pick<typeof LETTER_PAPER, 'width' | 'height'>
  descriptions: Record<PaperState, string>
  printBounds: { x: number; y: number; width: number; height: number }
}
import type { LETTER_PAPER } from './paper'
