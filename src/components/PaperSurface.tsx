import type { Artwork, FoldTemplate } from '../domain/types'
import { LETTER_PAPER } from '../domain/paper'
import { visibleRegions } from '../domain/templates'
import { assetUrl } from '../domain/artworkRepository'

const { width, height } = LETTER_PAPER

function NumberedMaster({ template }: { template: FoldTemplate }) {
  return (
    <>
      {template.bands.map((band) => (
        <g key={band.label}>
          <rect
            y={band.from * height}
            width={width}
            height={(band.to - band.from) * height}
            fill={band.color}
          />
          <text
            x={width / 2}
            y={((band.from + band.to) * height) / 2 + 18}
            textAnchor="middle"
            className="band-number"
          >
            {band.label}
          </text>
        </g>
      ))}
      {template.creases.map((crease) => (
        <g key={crease.at}>
          <path
            d={`M0 ${crease.at * height}H${width}`}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 5"
          />
          <text x="18" y={crease.at * height - 12} className="crease-label">
            {crease.direction} · {(crease.at * 100).toFixed(1)}%
          </text>
        </g>
      ))}
      {template.id === 'surprise' &&
        [0.25, 0.75].flatMap((y) =>
          [0.15, 0.85].map((x) => (
            <path
              key={`${x}-${y}`}
              d={`M${x * width} ${y * height - 22}v44m-14-22h28`}
              stroke="currentColor"
              strokeWidth="2"
            />
          )),
        )}
    </>
  )
}

export function PaperSurface({
  template,
  open,
  artwork,
  numbered = false,
}: {
  template: FoldTemplate
  open: boolean
  artwork?: Artwork
  numbered?: boolean
}) {
  const visibleHeight = height * (open ? 1 : template.closedHeight)
  const label = numbered
    ? `${template.name}, ${open ? 'open: bands ' + template.bands.map((band) => band.label).join(', ') : template.id === 'surprise' ? 'closed: bands 1 and 4 visible' : 'closed: band 1 visible'}`
    : artwork?.descriptions[open ? 'open' : 'closed']
  return (
    <svg
      className="paper-surface"
      viewBox={`0 0 ${width} ${visibleHeight}`}
      role="img"
      aria-label={label}
    >
      {visibleRegions(template, open).map((region) => (
        <svg
          key={region.from}
          x="0"
          y={region.at * height}
          width={width}
          height={(region.to - region.from) * height}
          viewBox={`0 ${region.from * height} ${width} ${(region.to - region.from) * height}`}
          overflow="hidden"
        >
          {numbered ? (
            <NumberedMaster template={template} />
          ) : (
            artwork && <image href={assetUrl(artwork.master.src)} width={width} height={height} />
          )}
        </svg>
      ))}
      {!open && template.id === 'surprise' && (
        <path d={`M0 ${height / 4}H${width}`} stroke="#827e711c" strokeWidth="2" />
      )}
      <rect
        x="0.5"
        y="0.5"
        width={width - 1}
        height={visibleHeight - 1}
        fill="none"
        stroke="#364c3720"
      />
    </svg>
  )
}
