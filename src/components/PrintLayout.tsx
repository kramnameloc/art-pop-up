import type { ReactNode } from 'react'
import { assetUrl } from '../domain/artworkRepository'
import {
  createPrintLayout,
  foldDirection,
  formatPrintDistance,
  PRINT_MARGIN,
  type PrintOptions,
} from '../domain/printLayout'
import type { Artwork } from '../domain/types'

type Layout = ReturnType<typeof createPrintLayout>

function Page({ layout, label, children }: { layout: Layout; label: string; children: ReactNode }) {
  const { paper } = layout
  return (
    <svg
      className="print-page"
      viewBox={`0 0 ${paper.width} ${paper.height}`}
      style={{ width: `${paper.width}pt`, height: `${paper.height}pt` }}
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={paper.width} height={paper.height} fill="white" />
      {children}
    </svg>
  )
}

function Master({ artwork, layout }: { artwork: Artwork; layout: Layout }) {
  return (
    <image
      className="print-master"
      href={assetUrl(artwork.master.src)}
      x={layout.x}
      y={layout.y}
      width={layout.width}
      height={layout.height}
    />
  )
}

function Guides({ layout, diagram = false }: { layout: Layout; diagram?: boolean }) {
  return (
    <g className="print-guides" fill="#666" stroke="#888" strokeWidth={diagram ? 2 : 0.6}>
      {layout.folds.map((fold) => (
        <g key={fold.number} data-fold={fold.number} data-y={fold.y}>
          <path
            d={`M${PRINT_MARGIN} ${fold.y}H${layout.paper.width - PRINT_MARGIN}`}
            strokeDasharray="3 5"
          />
          <text x={PRINT_MARGIN} y={fold.y - 6} stroke="none" fontSize={diagram ? 32 : 9}>
            {fold.number}
          </text>
          <text
            x={layout.paper.width - PRINT_MARGIN}
            y={fold.y - 6}
            textAnchor="end"
            stroke="none"
            fontSize={diagram ? 32 : 9}
          >
            {fold.number}
          </text>
        </g>
      ))}
    </g>
  )
}

function Ruler({ layout }: { layout: Layout }) {
  const width = (50 * 72) / 25.4
  const x = (layout.paper.width - width) / 2
  const y = layout.paper.height - 49
  return (
    <g className="print-ruler" fill="#444" stroke="#444" strokeWidth="0.7">
      <path d={`M${x} ${y}h${width}`} data-length-mm="50" />
      {Array.from({ length: 6 }, (_, index) => (
        <path key={index} d={`M${x + (index * width) / 5} ${y - 5}v10`} />
      ))}
      <text x={layout.paper.width / 2} y={y + 10} textAnchor="middle" stroke="none" fontSize="8">
        50 mm - check with a ruler
      </text>
    </g>
  )
}

/** Fixed SVG typography keeps the preview and paginated print output identical. */
function TextBlock({
  x,
  y,
  children,
  columns = 70,
  size = 11.5,
}: {
  x: number
  y: number
  children: string
  columns?: number
  size?: number
}) {
  const lines: string[] = []
  for (const word of children.split(' ')) {
    const last = lines.length - 1
    if (last < 0 || lines[last].length + word.length + 1 > columns) lines.push(word)
    else lines[last] += ` ${word}`
  }
  return (
    <text x={x} y={y} fontSize={size} fill="#333">
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : size * 1.5}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function Instructions({ artwork, layout }: { artwork: Artwork; layout: Layout }) {
  const { paper, template } = layout
  return (
    <Page layout={layout} label={`Folding instructions for ${artwork.title}, ${paper.label}`}>
      <g className="instruction-sheet" fill="#222" fontFamily="Arial, sans-serif">
        <text x="48" y="57" fontSize="9" letterSpacing="2">
          POP &amp; PAPER / MAKE IT TOGETHER
        </text>
        <text x="48" y="90" fontSize="27" fontWeight="bold">
          Color. Fold. Surprise!
        </text>
        <text x="48" y="116" fontSize="13">
          {artwork.title} · {paper.label}
        </text>
        <path d={`M48 133H${paper.width - 48}`} stroke="#bbb" />
        <text x="48" y="164" fontSize="15" fontWeight="bold">
          Before you fold
        </text>
        <TextBlock x={48} y={187} columns={43}>
          {`Print single-sided on ${paper.label}, portrait, at 100% / Actual size. Turn off headers and footers; choose no added margins. The page already includes safe margins.`}
        </TextBlock>
        <TextBlock x={48} y={279} columns={43}>
          Color the open picture. Keep the whole sheet: no trimming. Start with the picture facing
          you, the top of the picture at the top.
        </TextBlock>
        <svg
          x={paper.width - 211}
          y="155"
          width="163"
          height="211"
          viewBox={`0 0 ${paper.width} ${paper.height}`}
        >
          <rect
            x="1"
            y="1"
            width={paper.width - 2}
            height={paper.height - 2}
            fill="white"
            stroke="#777"
            strokeWidth="2"
          />
          <Master artwork={artwork} layout={layout} />
          <Guides layout={layout} diagram />
        </svg>
        <text x={paper.width - 129} y="383" textAnchor="middle" fontSize="9">
          Fold positions on the flat sheet
        </text>
        {layout.folds.map((fold, index) => (
          <g key={fold.number}>
            <text x="48" y={414 + index * 90} fontSize="14" fontWeight="bold">
              {fold.number}. {fold.direction === 'mountain' ? 'Fold back' : 'Fold forward'}
            </text>
            <TextBlock x={48} y={436 + index * 90}>
              {`Crease ${formatPrintDistance(fold.y)} from the top edge of the flat sheet. ${foldDirection(fold.direction)}`}
            </TextBlock>
          </g>
        ))}
        <text x="48" y="604" fontSize="15" fontWeight="bold">
          Ready for the reveal?
        </text>
        <TextBlock
          x={48}
          y={628}
          columns={43}
        >{`${template.printCheck} Pull the top edge up to open. Fold it back for another surprise.`}</TextBlock>
        <image
          href={assetUrl(artwork.thumbnail)}
          x={paper.width - 211}
          y="592"
          width="163"
          height="106"
        />
        <text x={paper.width - 129} y="716" textAnchor="middle" fontSize="9">
          Your folded picture
        </text>
        <TextBlock x={48} y={paper.height - 54} size={9} columns={97}>
          {`Trial print: physical folding still needs checking. ${template.name} v${template.version}. If guides are off, measure and lightly mark both edges before folding. Aim for a picture join within 2 mm.`}
        </TextBlock>
      </g>
    </Page>
  )
}

/** Used unchanged by both the on-screen preview and the browser's print document. */
export function PrintLayout({ artwork, options }: { artwork: Artwork; options: PrintOptions }) {
  const layout = createPrintLayout(artwork, options.paper)
  return (
    <div
      className="print-pages"
      data-template={`${layout.template.id}-v${layout.template.version}`}
      data-artwork={artwork.id}
    >
      <Page layout={layout} label={`${artwork.title}, full coloring page, ${layout.paper.label}`}>
        <Master artwork={artwork} layout={layout} />
        {options.guides && <Guides layout={layout} />}
        {options.ruler && <Ruler layout={layout} />}
      </Page>
      {options.instructions && <Instructions artwork={artwork} layout={layout} />}
    </div>
  )
}
