import { useEffect, useState } from 'react'
import {
  CUSTOM_ARTWORK_STORAGE_KEY,
  customArtwork,
  readCustomArtworks,
  removeCustomArtwork,
  resetCustomArtworks,
  saveCustomArtwork,
  type CustomArtworkRecord,
} from '../domain/customArtworkRepository'

function load() {
  try {
    return { artworks: readCustomArtworks().map(customArtwork), error: '' }
  } catch (cause) {
    return {
      artworks: [],
      error: cause instanceof Error ? cause.message : 'Saved pictures could not be read.',
    }
  }
}

export function useCustomArtworks() {
  const [collection, setCollection] = useState(load)
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === CUSTOM_ARTWORK_STORAGE_KEY || event.key === null) setCollection(load())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  return {
    ...collection,
    save(record: CustomArtworkRecord) {
      const artworks = saveCustomArtwork(record).map(customArtwork)
      setCollection({ artworks, error: '' })
    },
    remove(id: string) {
      try {
        setCollection({ artworks: removeCustomArtwork(id).map(customArtwork), error: '' })
      } catch (cause) {
        setCollection((current) => ({
          ...current,
          error: cause instanceof Error ? cause.message : 'This picture could not be removed.',
        }))
      }
    },
    reset() {
      try {
        resetCustomArtworks()
        setCollection({ artworks: [], error: '' })
      } catch (cause) {
        setCollection((current) => ({
          ...current,
          error: cause instanceof Error ? cause.message : 'Saved pictures could not be reset.',
        }))
      }
    },
  }
}
