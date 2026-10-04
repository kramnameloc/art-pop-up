import { describe, expect, it } from 'vitest'
import manifest from '../../public/artworks/manifest.json'
import { parseArtworkManifest } from './artworkRepository'

describe('artwork repository boundary', () => {
  it('loads the three reviewed concept placeholders', () => {
    expect(parseArtworkManifest(manifest)).toHaveLength(3)
  })
  it.each([null, {}, [], [{ id: 'unknown' }]])('rejects malformed collections: %j', (value) => {
    expect(() => parseArtworkManifest(value)).toThrow()
  })
  it('rejects unknown template versions and unreviewed assets', () => {
    expect(() => parseArtworkManifest([{ ...manifest[0], templateVersion: 9 }])).toThrow()
    expect(() => parseArtworkManifest([{ ...manifest[0], reviewStatus: 'draft' }])).toThrow()
    expect(() => parseArtworkManifest([{ ...manifest[0], templateId: 'thirds' }])).toThrow()
  })
  it('rejects duplicate identifiers that would select the wrong artwork', () => {
    expect(() => parseArtworkManifest([manifest[0], manifest[0]])).toThrow(/duplicate/)
  })
})
