import type { Artwork } from '../domain/types'
import { assetUrl } from '../domain/artworkRepository'
import { Icon } from './Icon'
import { PaperSurface } from './PaperSurface'
import { templates } from '../domain/templates'

export function DemoGallery({
  artworks,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: {
  artworks: Artwork[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  return (
    <aside className="gallery" aria-labelledby="gallery-title">
      <div className="section-heading">
        <span className="step-number">1</span>
        <h2 id="gallery-title">Pick a little idea</h2>
      </div>
      <p className="section-description">Every little picture holds a big surprise.</p>
      <div className="gallery-items">
        {artworks
          .filter((artwork) => artwork.reviewStatus === 'approved-demo')
          .map((artwork) => (
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
      <button
        className="secondary-button add-image-button"
        onClick={(event) => {
          event.currentTarget.focus()
          onAdd()
        }}
      >
        <Icon name="plus" size={18} /> Add image <span>Manual mode</span>
      </button>
      {artworks.some((artwork) => artwork.reviewStatus === 'personal') && (
        <section className="custom-gallery" aria-labelledby="custom-gallery-title">
          <h3 id="custom-gallery-title">Your pictures</h3>
          <p className="section-description">Saved in this browser.</p>
          <div className="custom-gallery-items">
            {artworks
              .filter((artwork) => artwork.reviewStatus === 'personal')
              .map((artwork) => (
                <div className="custom-gallery-item" key={artwork.id}>
                  <button
                    className={`art-card lavender ${artwork.id === selectedId ? 'selected' : ''}`}
                    aria-pressed={artwork.id === selectedId}
                    onClick={() => onSelect(artwork.id)}
                  >
                    <span className="card-art" aria-hidden="true">
                      <PaperSurface
                        template={templates[artwork.templateId]}
                        artwork={artwork}
                        open={false}
                      />
                    </span>
                    <span className="card-copy">
                      <strong>{artwork.title}</strong>
                      <span>{artwork.subtitle}</span>
                    </span>
                    <span className="selection-mark" aria-hidden="true">
                      <Icon name={artwork.id === selectedId ? 'check' : 'arrow'} size={14} />
                    </span>
                  </button>
                  <button
                    className="text-button remove-picture"
                    aria-label={`Remove ${artwork.title}`}
                    onClick={() => onRemove(artwork.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}
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
