import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const stage = (page: Page) => page.locator('.stage-section')
async function settle(page: Page, state: 'open' | 'closed') {
  await expect(stage(page)).toHaveAttribute('data-fold-state', state)
  await expect(page.locator('.folding-paper')).toHaveAttribute(
    'data-progress',
    state === 'open' ? '1.0000' : '0.0000',
  )
}
// Inspect painted pixels as well as accessible labels; a blank back face can still have valid ARIA.
async function expectPaperInk(page: Page) {
  const png = await page.locator('.folding-paper').screenshot()
  const blackPixels = await page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let count = 0
    for (let pixel = 0; pixel < data.length; pixel += 4) {
      if (data[pixel] < 40 && data[pixel + 1] < 40 && data[pixel + 2] < 40 && data[pixel + 3] > 200)
        count++
    }
    return count
  }, png.toString('base64'))
  expect(blackPixels, 'The paper must visibly paint black line art').toBeGreaterThan(100)
}
async function expectClosedProjection(page: Page) {
  const png = await page.locator('.folding-paper').screenshot()
  const thumbnail = await page.locator('.art-card.selected img').getAttribute('src')
  const mismatch = await page.evaluate(
    async ({ base64, thumbnail }) => {
      const actual = new Image(),
        expected = new Image()
      actual.src = `data:image/png;base64,${base64}`
      expected.src = thumbnail!
      await Promise.all([actual.decode(), expected.decode()])
      const canvas = document.createElement('canvas')
      canvas.width = actual.width
      canvas.height = actual.height
      const context = canvas.getContext('2d')!
      const mask = (image: HTMLImageElement) => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
        return Array.from(
          { length: canvas.width * canvas.height },
          (_, index) =>
            data[index * 4] < 80 &&
            data[index * 4 + 1] < 80 &&
            data[index * 4 + 2] < 80 &&
            data[index * 4 + 3] > 200,
        )
      }
      const painted = mask(actual),
        reference = mask(expected)
      // Permit two pixels of rasterization variance at clipped edges across engines/DPRs.
      function unmatched(from: boolean[], to: boolean[]) {
        let ink = 0,
          missed = 0
        for (let index = 0; index < from.length; index++) {
          if (!from[index]) continue
          ink++
          const x = index % canvas.width,
            y = Math.floor(index / canvas.width)
          let found = false
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              if (
                x + dx >= 0 &&
                x + dx < canvas.width &&
                y + dy >= 0 &&
                y + dy < canvas.height &&
                to[(y + dy) * canvas.width + x + dx]
              )
                found = true
            }
          if (!found) missed++
        }
        return ink ? missed / ink : 1
      }
      return Math.max(unmatched(painted, reference), unmatched(reference, painted))
    },
    { base64: png.toString('base64'), thumbnail },
  )
  expect(
    mismatch,
    'Closed paper must match the master’s closed projection and conceal its interior',
  ).toBeLessThan(0.15)
}
async function startDrag(page: Page, fraction: number) {
  const tab = page.getByRole('slider', { name: 'Unfold paper' })
  await tab.scrollIntoViewIfNeeded()
  const box = (await tab.boundingBox())!
  const width = await page
    .locator('.paper-holder')
    .evaluate((element) => element.getBoundingClientRect().width)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y - ((width * 792) / 612 / 2) * fraction, { steps: 8 })
  return { x, y, width }
}

test('three masters have coherent closed, intermediate, and open review views', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  for (const [title, id] of [
    ['Picnic cooler', 'picnic-cooler'],
    ['Cozy gift box', 'cozy-gift'],
    ['Tiny flower pot', 'tiny-garden'],
  ]) {
    await page.getByRole('button', { name: new RegExp(title) }).click()
    await settle(page, 'closed')
    await expect(page.locator('.folding-paper')).not.toHaveAccessibleName(
      /strawberry|rabbit|bumblebee/,
    )
    await expect(page.locator('.panel-front image')).toHaveCount(3)
    for (const image of await page.locator('.panel-front image').all()) {
      await expect(image).toHaveAttribute('href', `/artworks/${id}/master.svg`)
    }
    await expectPaperInk(page)
    await expectClosedProjection(page)
    await page.locator('.craft-table').screenshot({ path: testInfo.outputPath(`${id}-closed.png`) })
    await startDrag(page, 0.5)
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '50')
    await expectPaperInk(page)
    await page.locator('.craft-table').screenshot({ path: testInfo.outputPath(`${id}-half.png`) })
    await page.mouse.up()
    await page.getByRole('slider').press('End')
    await settle(page, 'open')
    await expect(page.locator('.folding-paper')).toHaveAccessibleName(/strawberry|rabbit|bumblebee/)
    await expectPaperInk(page)
    await page.locator('.craft-table').screenshot({ path: testInfo.outputPath(`${id}-open.png`) })
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  }
})

test('mouse dragging clamps, snaps both ways, and survives pointer cancellation', async ({
  page,
}) => {
  await page.goto('/')
  await startDrag(page, 0.3)
  await page.mouse.up()
  await settle(page, 'closed')
  await startDrag(page, 0.7)
  await page.mouse.up()
  await settle(page, 'open')
  await startDrag(page, -0.7)
  await page.mouse.up()
  await settle(page, 'closed')
  await startDrag(page, 2)
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '100')
  await page.getByRole('slider').dispatchEvent('pointercancel', { pointerId: 1 })
  await page.mouse.up()
  await settle(page, 'closed')
  await startDrag(page, 0.65)
  await page.getByRole('slider').evaluate((element) => element.releasePointerCapture(1))
  await page.mouse.up()
  await settle(page, 'closed')
})

test('keyboard, reset, resize, blur, and selection interrupt folding safely', async ({ page }) => {
  await page.goto('/')
  const tab = page.getByRole('slider')
  await tab.press('ArrowUp')
  await settle(page, 'open')
  await tab.press('Home')
  await settle(page, 'closed')
  await startDrag(page, 0.6)
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await settle(page, 'closed')
  await startDrag(page, 0.6)
  await page.setViewportSize({ width: 768, height: 1000 })
  await page.mouse.up()
  await settle(page, 'closed')
  await startDrag(page, 0.6)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await page.mouse.up()
  await settle(page, 'closed')
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await page.getByRole('button', { name: 'Reset paper' }).click()
  await settle(page, 'closed')
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await page.getByRole('button', { name: /Cozy gift box/ }).click()
  await settle(page, 'closed')
  await expect(page.locator('.folding-paper')).toHaveAccessibleName(/little gift box/)
  await page.waitForTimeout(900)
  await settle(page, 'closed')
})

test('rapid repeated input reverses animation without stale completion', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('.stage-controls .primary-button')
  await button.waitFor()
  await button.evaluate((element) => {
    for (let i = 0; i < 11; i++) (element as HTMLButtonElement).click()
  })
  await settle(page, 'open')
  await button.evaluate((element) => {
    for (let i = 0; i < 11; i++) (element as HTMLButtonElement).click()
  })
  await settle(page, 'closed')
})

test('device and grown-up reduced motion settle immediately, including mid-animation changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  expect(await stage(page).getAttribute('data-fold-state')).toBe('open')
  await page.getByRole('button', { name: 'Fold it back' }).click()
  expect(await stage(page).getAttribute('data-fold-state')).toBe('closed')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await settle(page, 'open')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('button', { name: 'For grown-ups' }).click()
  await page.getByRole('checkbox', { name: /Less movement/ }).check()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: 'Fold it back' }).click()
  expect(await stage(page).getAttribute('data-fold-state')).toBe('closed')
})

for (const asset of ['master.svg', 'thumbnail.svg']) {
  test(`a failed ${asset} can be retried without showing broken artwork`, async ({ page }) => {
    let fail = true
    await page.route(`**/artworks/cozy-gift/${asset}`, async (route) => {
      if (fail) await route.fulfill({ status: 404, body: 'Missing image' })
      else await route.continue()
    })
    await page.goto('/')
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.locator('.folding-paper')).toHaveCount(0)
    fail = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await page.getByRole('button', { name: /Cozy gift box/ }).click()
    await settle(page, 'closed')
  })
}

test('touch drag and touch tap use the same fold controls', async ({
  page,
  browserName,
  context,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Touch gesture dispatch is Chromium-specific; other engines use pointer coverage.',
  )
  await page.goto('/')
  const tab = page.getByRole('slider')
  await tab.scrollIntoViewIfNeeded()
  const box = (await tab.boundingBox())!
  const width = await page
    .locator('.paper-holder')
    .evaluate((element) => element.getBoundingClientRect().width)
  const client = await context.newCDPSession(page)
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x, y: y - width * 0.65 }],
  })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await settle(page, 'open')
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await settle(page, 'closed')
})

test('another manifest entry works without a concept-specific renderer', async ({ page }) => {
  await page.route('**/artworks/manifest.json', async (route) => {
    const response = await route.fetch()
    const artworks = await response.json()
    artworks.push({ ...artworks[0], id: 'another-surprise', title: 'Another surprise' })
    await route.fulfill({ response, json: artworks })
  })
  await page.goto('/')
  await page.getByRole('button', { name: /Another surprise/ }).click()
  await settle(page, 'closed')
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await settle(page, 'open')
})
