import { templates } from './templates'
import { LETTER_PAPER } from './paper'
import type { Artwork, Concept } from './types'

function isArtwork(value: unknown): value is Artwork {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Artwork>
  return (
    typeof item.id === 'string' &&
    /^[a-z][a-z0-9-]+$/.test(item.id) &&
    typeof item.title === 'string' &&
    item.title.length > 0 &&
    typeof item.subtitle === 'string' &&
    ['cooler', 'gift', 'garden'].includes(item.concept as Concept) &&
    ['peach', 'lavender', 'sage'].includes(item.palette ?? '') &&
    item.templateId === 'surprise' &&
    item.templateVersion === templates.surprise.version &&
    item.reviewStatus === 'approved-placeholder' &&
    item.master?.kind === 'concept-placeholder' &&
    item.master.width === LETTER_PAPER.width &&
    item.master.height === LETTER_PAPER.height &&
    typeof item.descriptions?.closed === 'string' &&
    typeof item.descriptions?.open === 'string' &&
    item.printBounds?.x === 0 &&
    item.printBounds?.y === 0 &&
    item.printBounds?.width === 1 &&
    item.printBounds?.height === 1
  )
}

export function parseArtworkManifest(value: unknown): Artwork[] {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isArtwork)) {
    throw new Error('The picture collection could not be read.')
  }
  if (new Set(value.map((item) => item.id)).size !== value.length) {
    throw new Error('The picture collection contains duplicate IDs.')
  }
  return value
}

export async function loadArtworks(signal: AbortSignal): Promise<Artwork[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}artworks/manifest.json`, { signal })
  if (!response.ok) throw new Error('The picture collection is taking a little break.')
  return parseArtworkManifest(await response.json())
}
