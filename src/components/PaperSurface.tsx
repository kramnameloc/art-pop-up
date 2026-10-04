import type { Artwork, FoldTemplate } from '../domain/types'
import { LETTER_PAPER } from '../domain/paper'
import { visibleRegions } from '../domain/templates'
import { ConceptSketch } from './ConceptSketch'

const { width, height } = LETTER_PAPER

function ConceptMaster({ artwork }: { artwork: Artwork }) {
  const iconSize = height * 0.42
  const drawing = (
    <svg
      x={(width - iconSize) / 2}
      y={(height / 2 - iconSize) / 2}
      width={iconSize}
      height={iconSize}
    >
      <ConceptSketch concept={artwork.concept} />
    </svg>
  )
  return (
    <>
      <rect width={width} height={height} fill="#fffefa" />
      <svg
        y="0"
        width={width}
        height={height / 4}
        viewBox={`0 0 ${width} ${height / 4}`}
        overflow="hidden"
      >
        {drawing}
      </svg>
      <svg
        y={height * 0.75}
        width={width}
        height={height / 4}
        viewBox={`0 ${height / 4} ${width} ${height / 4}`}
        overflow="hidden"
      >
        {drawing}
      </svg>
      <rect
        x="36"
        y={height / 4 + 20}
        width={width - 72}
        height={height / 2 - 40}
        rx="16"
        fill="#faf7ef"
      />
      <g transform={`translate(${width / 2} ${height / 2})`}>
        <text y="-100" textAnchor="middle" className="paper-number">
          02 + 03
        </text>
        <path
          d="m0-62 10 22 24 3-18 17 4 25L0-8l-20 13 4-25-18-17 24-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text y="65" textAnchor="middle" className="paper-note">
          Room for a little surprise.
        </text>
        <text y="102" textAnchor="middle" className="paper-small">
          Your artwork will grow here.
        </text>
      </g>
      <path
        d={`M0 ${height / 4}H${width}M0 ${height / 2}H${width}`}
        stroke="#ccc8bc"
        strokeWidth="1"
        strokeDasharray="5 6"
      />
    </>
  )
}

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
            artwork && <ConceptMaster artwork={artwork} />
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
