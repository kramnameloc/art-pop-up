import type { Artwork } from './types'
import { LETTER_PAPER } from './paper'
import { MAX_SCENE_LENGTH, MAX_TITLE_LENGTH, prepareSvg, svgImageUrl } from './manualArtwork'

export const CUSTOM_ARTWORK_STORAGE_KEY = 'pop-and-paper.custom-artworks.v1'
const MAX_PICTURES = 20

export interface CustomArtworkRecord {
  id: string
  title: string
  scene: string
  svg: string
  templateId: 'surprise'
  templateVersion: 1
  createdAt: string
}

export function customArtwork(record: CustomArtworkRecord): Artwork {
  const src = svgImageUrl(record.svg)
  return {
    id: record.id,
    title: record.title,
    subtitle: 'Your own little surprise',
    palette: 'lavender',
    templateId: record.templateId,
    templateVersion: record.templateVersion,
    reviewStatus: 'personal',
    master: { kind: 'svg', src, ...LETTER_PAPER },
    thumbnail: src,
    descriptions: {
      closed: `${record.title}, folded with the middle hidden.`,
      open: record.scene || `${record.title}, your custom picture on open paper.`,
    },
    printBounds: { x: 0, y: 0, width: 1, height: 1 },
    review: {
      visual: 'user-previewed',
      human: 'reviewed',
      physical: 'pending',
      notes: 'Personal SVG imported and previewed in the manual artwork flow.',
    },
  }
}

function validateRecord(value: unknown): CustomArtworkRecord {
  if (!value || typeof value !== 'object') throw new Error('Invalid saved picture.')
  const item = value as Partial<CustomArtworkRecord>
  if (
    typeof item.id !== 'string' ||
    !/^custom-[a-z0-9-]+$/.test(item.id) ||
    typeof item.title !== 'string' ||
    !item.title.trim() ||
    item.title.length > MAX_TITLE_LENGTH ||
    typeof item.scene !== 'string' ||
    item.scene.length > MAX_SCENE_LENGTH ||
    typeof item.svg !== 'string' ||
    item.templateId !== 'surprise' ||
    item.templateVersion !== 1 ||
    typeof item.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(item.createdAt))
  )
    throw new Error('Invalid saved picture.')
  return { ...item, svg: prepareSvg(item.svg).svg } as CustomArtworkRecord
}

export function readCustomArtworks(): CustomArtworkRecord[] {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(CUSTOM_ARTWORK_STORAGE_KEY)
  } catch {
    throw new Error(
      'Browser storage is unavailable. Allow local storage to save your pictures on this device.',
    )
  }
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    if (
      data?.version !== 1 ||
      !Array.isArray(data.pictures) ||
      data.pictures.length > MAX_PICTURES
    ) {
      throw new Error('Invalid collection.')
    }
    const pictures: CustomArtworkRecord[] = data.pictures.map(validateRecord)
    if (new Set(pictures.map((picture) => picture.id)).size !== pictures.length)
      throw new Error('Duplicate IDs.')
    return pictures
  } catch {
    // Keep the original bytes. A failed read must never silently overwrite saved work.
    throw new Error(
      'Saved pictures could not be read. They have been left in browser storage. Reset saved pictures to start a new collection.',
    )
  }
}

function writeCustomArtworks(pictures: CustomArtworkRecord[]) {
  try {
    window.localStorage.setItem(
      CUSTOM_ARTWORK_STORAGE_KEY,
      JSON.stringify({ version: 1, pictures }),
    )
  } catch {
    throw new Error(
      'The picture could not be saved. Browser storage may be full or disabled. Remove a saved picture or allow storage, then try again. Your SVG is still here.',
    )
  }
  return pictures
}

export function saveCustomArtwork(record: CustomArtworkRecord) {
  const validated = validateRecord(record)
  // Read again before mutations, so another tab's saved pictures are retained.
  const pictures = readCustomArtworks()
  if (pictures.length >= MAX_PICTURES)
    throw new Error('Your collection has 20 pictures. Remove one to make room for another.')
  if (pictures.some((picture) => picture.id === validated.id))
    throw new Error('This picture is already saved.')
  return writeCustomArtworks([...pictures, validated])
}

export function removeCustomArtwork(id: string) {
  return writeCustomArtworks(readCustomArtworks().filter((picture) => picture.id !== id))
}

export function resetCustomArtworks() {
  try {
    window.localStorage.removeItem(CUSTOM_ARTWORK_STORAGE_KEY)
  } catch {
    throw new Error('Browser storage is unavailable. Allow local storage and try again.')
  }
}
