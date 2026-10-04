import { templates } from './templates'
import { LETTER_PAPER } from './paper'
import type { Artwork } from './types'

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
const isAssetPath = (value: unknown): value is string =>
  typeof value === 'string' && /^artworks\/[a-z][a-z0-9-]+\/(master|thumbnail)\.svg$/.test(value)

function isArtwork(value: unknown): value is Artwork {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Artwork>
  const bounds = item.printBounds
  return (
    typeof item.id === 'string' &&
    /^[a-z][a-z0-9-]+$/.test(item.id) &&
    isText(item.title) &&
    isText(item.subtitle) &&
    ['peach', 'lavender', 'sage'].includes(item.palette ?? '') &&
    item.templateId === 'surprise' &&
    item.templateVersion === templates.surprise.version &&
    item.reviewStatus === 'approved-demo' &&
    item.master?.kind === 'svg' &&
    isAssetPath(item.master.src) &&
    item.master.width === LETTER_PAPER.width &&
    item.master.height === LETTER_PAPER.height &&
    isAssetPath(item.thumbnail) &&
    isText(item.descriptions?.closed) &&
    isText(item.descriptions?.open) &&
    item.review?.visual === 'agent-reviewed' &&
    item.review.human === 'pending' &&
    item.review.physical === 'pending' &&
    isText(item.review.notes) &&
    !!bounds &&
    Object.values(bounds).every(Number.isFinite) &&
    bounds.x >= 0 &&
    bounds.y >= 0 &&
    bounds.width > 0 &&
    bounds.height > 0 &&
    bounds.x + bounds.width <= 1 &&
    bounds.y + bounds.height <= 1
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

export function assetUrl(path: string) {
  if (path.startsWith('data:image/svg+xml;charset=utf-8,')) return path
  return `${import.meta.env.BASE_URL}${path}`
}

function preloadImage(path: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const cleanup = () => {
      image.onload = null
      image.onerror = null
      signal.removeEventListener('abort', abort)
    }
    const abort = () => {
      cleanup()
      image.removeAttribute('src')
      reject(signal.reason)
    }
    if (signal.aborted) {
      abort()
      return
    }
    signal.addEventListener('abort', abort, { once: true })
    image.onload = () => {
      cleanup()
      resolve()
    }
    image.onerror = () => {
      cleanup()
      reject(new Error('A picture could not be loaded.'))
    }
    image.src = assetUrl(path)
  })
}

export async function loadArtworks(signal: AbortSignal): Promise<Artwork[]> {
  const response = await fetch(assetUrl('artworks/manifest.json'), { signal })
  if (!response.ok) throw new Error('The picture collection is taking a little break.')
  const artworks = parseArtworkManifest(await response.json())
  await Promise.all(
    artworks.flatMap((artwork) => [
      preloadImage(artwork.master.src, signal),
      preloadImage(artwork.thumbnail, signal),
    ]),
  )
  signal.throwIfAborted()
  return artworks
}
