import { readFile, writeFile } from 'node:fs/promises'
import { templates } from '../src/domain/templates.ts'
import type { Artwork } from '../src/domain/types.ts'

const root = new URL('../public/', import.meta.url)
const artworks: Artwork[] = JSON.parse(
  await readFile(new URL('artworks/manifest.json', root), 'utf8'),
)
const checkOnly = process.argv.includes('--check')
for (const artwork of artworks) {
  const source = await readFile(new URL(artwork.master.src, root), 'utf8')
  const body = source
    .replace(/^[\s\S]*?<svg\b[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/[ \t]+$/gm, '')
  const template = templates[artwork.templateId]
  const { width, height } = artwork.master
  const regions = template.closedVisible
    .map(
      (region) =>
        `<svg y="${region.at * height}" width="${width}" height="${(region.to - region.from) * height}" viewBox="0 ${region.from * height} ${width} ${(region.to - region.from) * height}" overflow="hidden">${body}</svg>`,
    )
    .join('\n')
  const thumbnail = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height * template.closedHeight}">\n${regions}\n</svg>\n`
  const destination = new URL(artwork.thumbnail, root)
  if (checkOnly) {
    if ((await readFile(destination, 'utf8')) !== thumbnail) {
      throw new Error(`${artwork.thumbnail} is stale. Run npm run artwork:thumbnails.`)
    }
    console.log(`Verified ${artwork.thumbnail}`)
  } else {
    await writeFile(destination, thumbnail)
    console.log(`Derived ${artwork.thumbnail}`)
  }
}
