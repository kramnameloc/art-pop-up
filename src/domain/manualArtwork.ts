import { LETTER_PAPER } from './paper'
import { templates } from './templates'

export const MAX_SVG_BYTES = 400_000
export const MAX_SCENE_LENGTH = 1500
export const MAX_TITLE_LENGTH = 60
const SVG_NS = 'http://www.w3.org/2000/svg'
const { width, height } = LETTER_PAPER
const viewBox = `0 0 ${width} ${height}`

export function buildArtworkPrompt(scene: string) {
  const template = templates.surprise
  const [top, bottom] = template.closedVisible
  const topEnd = top.to * height
  const bottomStart = bottom.from * height
  return `You are an expert coloring-book illustrator and SVG artist. Create a polished, original, child-friendly folding surprise picture with the cozy, cute, bold-and-easy appeal of Coco Wyo coloring books. Take time to compose and refine the illustration before delivering the finished SVG.

MY SCENE IDEA (use this as the subject, while keeping all technical rules below):
${scene.trim()}

RESPONSE FORMAT — ONE COPYABLE CODE BLOCK
Put the ENTIRE SVG document inside exactly ONE fenced Markdown code block labeled svg. Your first response line must be ${'```svg'} and your last response line must be ${'```'}. The line immediately after the opening fence must be <svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="${viewBox}">. The line immediately before the closing fence must be </svg>.
Include every SVG element, from the opening root through the closing root, inside that same block. No introduction, headings, explanations, raw SVG outside the block, additional code blocks, or trailing text. Do not split the drawing into snippets. Do not use an indented Markdown code block, HTML entities in place of tags, a rendered image, PNG, download link, or HTML page. Return a complete, ready-to-import drawing with no ellipses, placeholders, or unfinished paths. The user must be able to use ONE “Copy code” button to copy the entire file.

PAPER AND FOLD — ${template.id} v${template.version}
This is ONE master composition on portrait US Letter paper (8.5 × 11 inches). Coordinates run left to right and top to bottom.
- Top visible band: y=0 to ${topEnd}.
- Hidden surprise: y=${topEnd} to ${bottomStart}.
- Bottom visible band: y=${bottomStart} to ${height}.
- When folded, y=${topEnd} joins y=${bottomStart}: the bottom band moves UP by ${bottomStart - topEnd} units. The closed picture is ${width} × ${height * template.closedHeight}.
- The top and bottom bands must form one complete simple object when joined. Match outlines at exactly the same x coordinates at y=${topEnd} and y=${bottomStart}, with matching stroke widths and directions. Keep faces away from that join.
- Place the surprising characters and objects entirely inside the hidden middle. Keep important details at least 12 units away from its edges.
- The actual creases are at ${template.creases.map((crease) => `y=${crease.at * height} (${crease.direction})`).join(' and ')}. y=${bottomStart} is a visibility boundary, NOT another crease. Do not draw crease lines; the app adds print guides.
- Keep outer artwork within x=24 to ${width - 24} and y=24 to ${height - 24}. The full open picture must also look coherent. Never create separate folded and open images.

ART DIRECTION — COZY, CUTE, AND BEAUTIFULLY FINISHED
- Aim for a Coco Wyo-inspired cozy coloring-book aesthetic: soft rounded silhouettes, charming expressive faces, warm little storytelling details, and a calm, inviting scene. Invent original characters and a new composition; do not reproduce an existing book page.
- Make the subject immediately recognizable. Give animals pleasing proportions, rounded cheeks, intentional eyes and smiles, and believable little poses. Match anatomy to the requested animal (for example, wings and a beak for a bird). Avoid generic stick figures, lumpy outlines, accidental extra limbs, and stacks of unrelated circles.
- Build a composed scene around one or two main subjects. Add a few thoughtfully placed supporting objects that tell the story and belong together. Use balanced spacing and varied sizes. Avoid an empty middle with tiny floating icons, random confetti, visual clutter, or a crowded wall of objects.
- Use flowing, deliberate Bézier contours for organic shapes. Basic shapes are useful building blocks, but refine them into finished illustrations. Keep curves smooth, proportions consistent, and intersections clean; no accidental tangencies, awkward overlaps, or lines running through faces.
- Use confident black outer outlines around 4 units wide and supporting details around 2.5–3 units, with round linecaps and joins. Keep line weights consistent across the whole picture and match the seam strokes exactly.
- Use white fills and generous enclosed coloring areas. Leave breathing room between shapes and avoid tiny slivers that are hard to color. Small solid black eyes or noses are fine. No gray, color, gradients, shadows, hatching, heavy black fills, text, labels, watermarks, logos, or branded characters.
- Let the open composition feel like a delightful finished coloring page, while the folded silhouette still reads as one appealing, complete object. Use the hidden middle intentionally; essential surprise details must remain hidden when closed.

SVG COMPATIBILITY
Use simple vector elements: svg, g, path, rect, circle, ellipse, line, polyline, polygon, defs, clipPath, mask, linearGradient, radialGradient, stop, title, desc. Prefer basic shapes and paths. Use presentation attributes such as fill, stroke, stroke-width, stroke-linecap, stroke-linejoin, and transform. Local url(#id) references are allowed for fills, strokes, clipping, and masks. Do not use scripts, event handlers, foreignObject, image, use, text, style elements or style attributes, CSS classes, animation, external URLs, fonts, or embedded raster images. Keep the SVG under 400 KB.

FINAL QUALITY PASS — DO THIS SILENTLY BEFORE ANSWERING
1. Mentally join y=${topEnd} to y=${bottomStart}. Verify every crossing outline has the same x position, stroke width, and direction. Check the folded silhouette is recognizable and no face is split.
2. Inspect the full open scene for balanced composition, readable expressions, smooth curves, believable anatomy, clean overlaps, and enjoyable coloring spaces. Refine weak or rough parts before returning it.
3. Verify all important surprise elements stay in the hidden middle and all artwork stays inside the safe bounds.
4. Check valid XML, closed tags, the exact viewBox, and only supported SVG elements and attributes.
5. Return only ONE fenced svg block containing the entire finished SVG. No SVG or explanation outside it.`
}

const elements = new Set([
  'svg',
  'g',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'defs',
  'clipPath',
  'mask',
  'linearGradient',
  'radialGradient',
  'stop',
  'title',
  'desc',
])
const attributes = new Set([
  'id',
  'viewBox',
  'preserveAspectRatio',
  'x',
  'y',
  'width',
  'height',
  'd',
  'points',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x1',
  'y1',
  'x2',
  'y2',
  'fx',
  'fy',
  'fr',
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-opacity',
  'opacity',
  'transform',
  'clip-path',
  'clip-rule',
  'mask',
  'clipPathUnits',
  'maskUnits',
  'maskContentUnits',
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'offset',
  'stop-color',
  'stop-opacity',
  'vector-effect',
  'color',
])
const drawable = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'])
const localReference = /^url\(#[a-zA-Z_][\w.-]*\)$/

/** Parse in an inert XML document, then rebuild only the static vector subset we support. */
export function prepareSvg(source: string): { svg: string; fitted: boolean } {
  if (new TextEncoder().encode(source).length > MAX_SVG_BYTES) {
    throw new Error('This SVG is too large. Use a simpler SVG under 400 KB.')
  }
  const xml = source
    .trim()
    .replace(/^```(?:svg|xml|html)?\s*\n([\s\S]*?)\n```$/i, '$1')
    .trim()
  if (!xml) throw new Error('Upload an SVG file or paste its SVG code first.')
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error(
      'Remove the DOCTYPE or entity declarations. Only a standalone SVG is supported.',
    )
  }
  const parsed = new DOMParser().parseFromString(xml, 'image/svg+xml')
  const root = parsed.documentElement
  if (parsed.querySelector('parsererror') || root.localName !== 'svg') {
    throw new Error('This is not valid SVG XML. Paste the complete code from <svg> to </svg>.')
  }
  if ([...parsed.childNodes].some((node) => node.nodeType === 7)) {
    throw new Error('Remove XML processing instructions. External stylesheets are not supported.')
  }
  const box = root
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number)
  if (!box || box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) {
    throw new Error(`Add a valid viewBox to the SVG, ideally viewBox="${viewBox}".`)
  }
  const fitted = box.some((value, i) => value !== [0, 0, width, height][i])
  const doc = document.implementation.createDocument(SVG_NS, 'svg')
  let count = 0
  let shapes = 0
  function copy(element: Element, depth: number): Element {
    if (++count > 5000 || depth > 64) {
      throw new Error('This SVG is too complex. Use fewer than 5,000 elements and simpler groups.')
    }
    if (
      !elements.has(element.localName) ||
      (element.namespaceURI && element.namespaceURI !== SVG_NS)
    ) {
      throw new Error(
        `The <${element.tagName}> element is not supported. Use static vector shapes from the prompt.`,
      )
    }
    if (drawable.has(element.localName)) shapes++
    const clean = doc.createElementNS(SVG_NS, element.localName)
    for (const attribute of [...element.attributes]) {
      if (attribute.name === 'xmlns' && attribute.value === SVG_NS) continue
      if (!attributes.has(attribute.name) || attribute.namespaceURI) {
        throw new Error(
          `The “${attribute.name}” attribute is not supported. Use presentation attributes such as fill and stroke; remove styles, links, and event handlers.`,
        )
      }
      const value = attribute.value.trim()
      // Backslash escapes and control characters can disguise CSS URLs. No CSS parsing is needed.
      if (
        value.includes('\\') ||
        [...value].some(
          (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
        ) ||
        (/url\s*\(/i.test(value) && !localReference.test(value)) ||
        /(?:https?:|data:|javascript:|\/\/|\/\*)/i.test(value)
      ) {
        throw new Error(
          'External resources and CSS are not supported. Use plain attributes and local url(#id) references only.',
        )
      }
      clean.setAttribute(attribute.name, value)
    }
    for (const node of [...element.childNodes]) {
      if (node.nodeType === 1) clean.appendChild(copy(node as Element, depth + 1))
      else if (node.nodeType === 3 || node.nodeType === 4)
        clean.appendChild(doc.createTextNode(node.textContent ?? ''))
      else if (node.nodeType !== 8) throw new Error('Only static SVG markup is supported.')
    }
    return clean
  }
  const clean = copy(root, 0)
  if (!shapes)
    throw new Error('This SVG has no vector shapes to display. Ask for a complete drawing.')
  clean.setAttribute('width', String(width))
  clean.setAttribute('height', String(height))
  clean.setAttribute('x', '0')
  clean.setAttribute('y', '0')
  clean.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  if (fitted) {
    // Contain arbitrary viewBoxes without stretching; all app surfaces still use Letter coordinates.
    doc.documentElement.setAttribute('viewBox', viewBox)
    doc.documentElement.setAttribute('width', String(width))
    doc.documentElement.setAttribute('height', String(height))
    doc.documentElement.appendChild(clean)
  } else doc.replaceChild(clean, doc.documentElement)
  const svg = new XMLSerializer().serializeToString(doc)
  if (new TextEncoder().encode(svg).length > MAX_SVG_BYTES) {
    throw new Error('The prepared SVG exceeds 400 KB. Simplify the drawing and try again.')
  }
  return { svg, fitted }
}

export function svgImageUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
