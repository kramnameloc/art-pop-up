import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'

const key = 'pop-and-paper.custom-artworks.v1'
const svg = readFileSync('public/artworks/cozy-gift/master.svg', 'utf8')
const simpleSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792"><circle cx="306" cy="396" r="120" fill="white" stroke="black" stroke-width="4"/></svg>'

async function openImport(page: Page) {
  await page.getByRole('button', { name: 'Add image Manual mode' }).click()
  await page.getByRole('button', { name: 'I already have an SVG' }).click()
}

async function previewSvg(page: Page, title = 'Mouse party', source = svg) {
  await page.getByLabel('Picture name', { exact: true }).fill(title)
  await page.getByLabel('Or paste SVG code').fill(source)
  await page.getByRole('button', { name: 'Preview my picture' }).click()
  await expect(page.getByRole('button', { name: 'Save to my pictures' })).toBeVisible()
}

test('scene → prompt → pasted SVG → saved, folded, printed and reloaded without external requests', async ({
  page,
  context,
}) => {
  const externalRequests: string[] = []
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:4173/'))
      externalRequests.push(request.url())
  })
  // Clipboard stubbing tests copy behavior consistently across engines and permission settings.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          document.body.dataset.copiedPrompt = text
        },
      },
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Add image Manual mode' }).click()
  await expect(page.getByRole('button', { name: 'Build my prompt' })).toBeDisabled()
  await page
    .getByLabel('Describe your scene')
    .fill('A gift box with a surprise mouse party inside.')
  await page.getByRole('button', { name: 'Build my prompt' }).click()
  const prompt = await page.getByLabel('Your ChatGPT prompt').inputValue()
  expect(prompt).toContain('surprise mouse party')
  expect(prompt).toContain('y=198 joins y=594')
  await page.getByRole('button', { name: 'Copy prompt', exact: true }).click()
  expect(await page.locator('body').getAttribute('data-copied-prompt')).toBe(prompt)
  await expect(page.getByRole('status')).toContainText('Prompt copied')
  await page.getByRole('button', { name: 'I have my SVG' }).click()
  await previewSvg(page, 'Mouse party', '```svg\n' + svg + '\n```')
  await expect(page.locator('.custom-preview-papers svg.paper-surface')).toHaveCount(2)
  await page.getByRole('button', { name: 'Save to my pictures' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const card = page.getByRole('button', { name: /Mouse party Your own/ })
  await expect(card).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.stage-section')).toHaveAttribute('data-fold-state', 'closed')
  const master = await page.locator('.panel-front image').first().getAttribute('href')
  expect(master).toMatch(/^data:image\/svg\+xml/)
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await expect(page.locator('.stage-section')).toHaveAttribute('data-fold-state', 'open')
  await page.getByRole('button', { name: 'Print & color', exact: true }).click()
  for (const paper of ['US Letter', 'A4']) {
    await page.getByRole('radio', { name: new RegExp(paper) }).check()
    await expect(page.locator('.print-preview .print-master').first()).toHaveAttribute(
      'href',
      master!,
    )
    expect(await page.locator('.print-preview .print-pages').innerHTML()).toBe(
      await page.locator('.print-output .print-pages').innerHTML(),
    )
  }
  await page.getByRole('button', { name: 'Back to playing' }).click()
  const records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).pictures, key)
  expect(records).toHaveLength(1)
  expect(records[0].svg).toContain('<svg')
  expect(records[0].scene).toContain('mouse party')
  await page.reload()
  await card.click()
  await expect(page.locator('.panel-front image').first()).toHaveAttribute('href', master!)
  // Removal updates another open tab too, and leaves built-in artwork available.
  const other = await context.newPage()
  await other.goto('/')
  await expect(other.getByRole('button', { name: /Mouse party Your own/ })).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Remove Mouse party', exact: true }).click()
  await expect(card).toHaveCount(0)
  await expect(other.getByRole('button', { name: /Mouse party Your own/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Picnic cooler/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(card).toHaveCount(0)
  expect(externalRequests).toEqual([])
})

test('file upload fits another viewBox, preserves aspect ratio, and clears stale previews on edit', async ({
  page,
}) => {
  await page.goto('/')
  await openImport(page)
  await page.getByLabel('Upload an SVG file').setInputFiles({
    name: 'Round surprise.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(simpleSvg.replace('0 0 612 792', '0 0 612 612')),
  })
  await expect(page.getByLabel('Picture name', { exact: true })).toHaveValue('Round surprise')
  await page.getByRole('button', { name: 'Preview my picture' }).click()
  await expect(page.getByText('This SVG was fitted to the paper.', { exact: false })).toBeVisible()
  const uri = await page.locator('.custom-preview-papers image').first().getAttribute('href')
  expect(decodeURIComponent(uri!)).toContain('preserveAspectRatio="xMidYMid meet"')
  await page.getByLabel('Or paste SVG code').fill('<svg>broken')
  await expect(page.getByRole('button', { name: 'Save to my pictures' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Preview my picture' }).click()
  await expect(page.getByRole('alert')).toContainText('not valid SVG XML')
  await page
    .getByLabel('Upload an SVG file')
    .setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: Buffer.from('not svg') })
  await expect(page.getByRole('alert')).toContainText('Choose an .svg file')
  await page.getByLabel('Upload an SVG file').setInputFiles({
    name: 'large.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.alloc(400_001, ' '),
  })
  await expect(page.getByRole('alert')).toContainText('too large')
  await page
    .getByLabel('Upload an SVG file')
    .setInputFiles({ name: 'Recovered.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  await page.getByRole('button', { name: 'Preview my picture' }).click()
  await page.getByRole('button', { name: 'Save to my pictures' }).click()
  await expect(page.getByRole('button', { name: /Round surprise Your own/ })).toBeVisible()
})

test('invalid and active SVG markup is rejected before display or storage', async ({ page }) => {
  await page.goto('/')
  const failures = await page.evaluate(async () => {
    const modulePath = '/src/domain/manualArtwork.ts'
    const { prepareSvg } = await import(modulePath)
    const wrap = (body: string, attrs = '') =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792" ${attrs}>${body}</svg>`
    const invalid = [
      '<html>Not SVG</html>',
      '<svg>',
      wrap('<script>alert(1)</script>'),
      wrap('<foreignObject><div>HTML</div></foreignObject>'),
      wrap('<image href="https://example.com/tracker"/>'),
      wrap('<rect width="10" height="10"/>', 'onload="alert(1)"'),
      wrap('<style>@import "https://example.com/style";</style><rect/>'),
      wrap('<rect style="fill:red"/>'),
      wrap('<rect fill="url(https://example.com/paint)"/>'),
      wrap('<rect fill="u\\72l(https://example.com/paint)"/>'),
      wrap('<rect fill="url(/*x*/#paint)"/>'),
      wrap('<use href="#loop" id="loop"/>'),
      wrap('<animate attributeName="x"/>'),
      wrap('<rect xmlns="http://www.w3.org/1999/xhtml"/>'),
      '<?xml-stylesheet href="https://example.com/x"?>' + wrap('<rect/>'),
      '<!DOCTYPE svg [<!ENTITY x "value">]>' + wrap('<title>&x;</title>'),
      '<svg viewBox="0 0 0 0"><path/></svg>',
      '<svg><path/></svg>',
      wrap('<title>empty</title>'),
      wrap('<g>'.repeat(66) + '<rect/>' + '</g>'.repeat(66)),
      wrap('<rect/>'.repeat(5001)),
      ' '.repeat(400_001),
    ]
    return invalid
      .map((source) => {
        try {
          prepareSvg(source)
          return source.slice(0, 90)
        } catch {
          return null
        }
      })
      .filter(Boolean)
  })
  expect(failures).toEqual([])
  await openImport(page)
  await page
    .getByLabel('Or paste SVG code')
    .fill(simpleSvg.replace('<circle', '<script>alert(1)</script><circle'))
  await page.getByRole('button', { name: 'Preview my picture' }).click()
  await expect(page.getByRole('alert')).toContainText('<script>')
  await expect(page.getByRole('button', { name: 'Save to my pictures' })).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull()
})

test('unavailable clipboard selects the prompt for manual copying', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', { value: undefined }),
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'Add image Manual mode' }).click()
  await page.getByLabel('Describe your scene').fill('A flower full of butterflies')
  await page.getByRole('button', { name: 'Build my prompt' }).click()
  await page.getByRole('button', { name: 'Copy prompt', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('prompt is selected')
  expect(
    await page
      .getByLabel('Your ChatGPT prompt')
      .evaluate((element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart),
  ).toBeGreaterThan(1000)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByLabel('Describe your scene')).toHaveValue('A flower full of butterflies')
})

test('a storage quota failure preserves existing pictures and the pending SVG for retry', async ({
  page,
}) => {
  await page.goto('/')
  await openImport(page)
  await previewSvg(page, 'First picture', simpleSvg)
  await page.getByRole('button', { name: 'Save to my pictures' }).click()
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await openImport(page)
  await previewSvg(page, 'Second picture', simpleSvg)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'pop-and-paper.custom-artworks.v1') {
        Storage.prototype.setItem = original
        throw new DOMException('Full', 'QuotaExceededError')
      }
      original.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: 'Save to my pictures' }).click()
  await expect(page.getByRole('alert')).toContainText('storage may be full')
  await expect(page.getByLabel('Or paste SVG code')).toHaveValue(simpleSvg)
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
  await page.getByRole('button', { name: 'Save to my pictures' }).click()
  await expect(page.getByRole('button', { name: /Second picture Your own/ })).toBeVisible()
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).pictures.length, key),
  ).toBe(2)
})

test('corrupted storage is preserved until an explicit reset, and demos remain usable', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate((key) => localStorage.setItem(key, '{broken'), key)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Saved pictures could not be read')
  await expect(page.getByRole('button', { name: /Picnic cooler/ })).toBeVisible()
  await openImport(page)
  await previewSvg(page, 'New picture', simpleSvg)
  await page.getByRole('button', { name: 'Save to my pictures' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('left in browser storage')
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('{broken')
  await page.getByRole('button', { name: 'Close dialog' }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reset saved pictures' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull()
})

for (const width of [360, 768, 1280]) {
  test(`manual mode is accessible and fits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Add image Manual mode' }).click()
    await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    await page.getByLabel('Describe your scene').fill('A gift box with a little animal party')
    await page.getByRole('button', { name: 'Build my prompt' }).click()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.screenshot({ path: testInfo.outputPath(`manual-prompt-${width}.png`) })
    await page.getByRole('button', { name: 'I have my SVG' }).click()
    await previewSvg(page)
    const dialog = page.getByRole('dialog')
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    )
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.locator('.custom-preview').scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`manual-preview-${width}.png`) })
    await page.getByRole('button', { name: 'Save to my pictures' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Add image Manual mode' })).toBeFocused()
  })
}
