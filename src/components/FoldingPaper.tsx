import type { Artwork } from '../domain/types'
import { foldGeometry } from '../domain/foldGeometry'
import { templates } from '../domain/templates'
import { assetUrl } from '../domain/artworkRepository'

export function FoldingPaper({ artwork, progress }: { artwork: Artwork; progress: number }) {
  const template = templates[artwork.templateId]
  const geometry = foldGeometry(template, progress)
  const { width, height } = artwork.master
  const label =
    progress === 0
      ? artwork.descriptions.closed
      : progress === 1
        ? artwork.descriptions.open
        : `${artwork.title}, partly unfolded. Keep opening to discover the surprise.`
  return (
    <div
      className="folding-paper"
      role="img"
      aria-label={label}
      data-progress={progress.toFixed(4)}
      style={{ height: `${geometry.height * 100}%` }}
    >
      <div className="paper-panels" aria-hidden="true">
        {geometry.panels
          .slice()
          .reverse()
          .map(({ panel, y, z, angle }) => (
            <div
              key={panel.id}
              className={`paper-panel panel-${panel.id}`}
              data-panel={panel.id}
              style={{
                top: `${(y / geometry.height) * 100}%`,
                height: `${((panel.to - panel.from) / geometry.height) * 100}%`,
                zIndex: panel.layer,
                // Separate coplanar layers by a fraction of a pixel to preserve occlusion at rest.
                transform: `translateZ(calc(${(z / template.aspectRatio) * 100}cqw + ${panel.layer * 0.2}px)) rotateX(${angle}deg)`,
              }}
            >
              <svg
                className="panel-front"
                style={{ visibility: angle > -90 ? 'visible' : 'hidden' }}
                viewBox={`0 ${panel.from * height} ${width} ${(panel.to - panel.from) * height}`}
              >
                <image href={assetUrl(artwork.master.src)} width={width} height={height} />
              </svg>
              <div
                className="panel-back"
                style={{ visibility: angle < -90 ? 'visible' : 'hidden' }}
              />
            </div>
          ))}
      </div>
    </div>
  )
}
