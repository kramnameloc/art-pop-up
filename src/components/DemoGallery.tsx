import type { Artwork } from '../domain/types'
import { assetUrl } from '../domain/artworkRepository'
import { Icon } from './Icon'

export function DemoGallery({
  artworks,
  selectedId,
  onSelect,
}: {
  artworks: Artwork[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <aside className="gallery" aria-labelledby="gallery-title">
      <div className="section-heading">
        <span className="step-number">1</span>
        <h2 id="gallery-title">Pick a little idea</h2>
      </div>
      <p className="section-description">Every little picture holds a big surprise.</p>
      <div className="gallery-items">
        {artworks.map((artwork) => (
          <button
            key={artwork.id}
            className={`art-card ${artwork.palette} ${artwork.id === selectedId ? 'selected' : ''}`}
            aria-pressed={artwork.id === selectedId}
            onClick={() => onSelect(artwork.id)}
          >
            <span className="card-art">
              <img src={assetUrl(artwork.thumbnail)} alt="" width="612" height="396" />
            </span>
            <span className="card-copy">
              <strong>{artwork.title}</strong>
              <span>{artwork.subtitle}</span>
            </span>
            <span className="selection-mark" aria-hidden="true">
              {artwork.id === selectedId ? (
                <Icon name="check" size={14} />
              ) : (
                <Icon name="arrow" size={15} />
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="little-note">
        <Icon name="heart" size={24} />
        <p>
          Small ideas.
          <br />
          <strong>Wonderful imaginations.</strong>
        </p>
        <span className="note-spark" aria-hidden="true">
          ✳
        </span>
      </div>
    </aside>
  )
}
