import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('gallery selection, paper controls, and reset work without external services', async ({
  page,
  baseURL,
}) => {
  const errors: string[] = []
  const external: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin) external.push(request.url())
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Picnic cooler/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await expect(page.getByRole('img', { name: /open picnic cooler/ })).toBeVisible()
  await page.getByRole('button', { name: /Cozy gift box/ }).click()
  await expect(page.getByRole('img', { name: /little gift box/ })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Open the surprise', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false')
  await page.getByRole('button', { name: /Tiny flower pot/ }).click()
  await expect(page.getByRole('img', { name: /smiling flower pot/ })).toBeVisible()
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await page.getByRole('button', { name: 'Reset paper' }).click()
  await expect(page.getByRole('button', { name: 'Reset paper' })).toBeDisabled()
  expect(errors).toEqual([])
  expect(external).toEqual([])
})

for (const width of [360, 768, 1280]) {
  test(`layout and accessibility at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Picnic cooler/ })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    for (const button of await page.getByRole('button').all()) {
      if (!(await button.isVisible())) continue
      const box = await button.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.width).toBeGreaterThanOrEqual(44)
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.screenshot({ path: testInfo.outputPath(`studio-${width}.png`), fullPage: true })
    const closedPaper = page.getByRole('img', { name: /smiling picnic cooler/ })
    await expect(closedPaper).toHaveAttribute('data-progress', '0.0000')
    const closedWidth = await closedPaper.evaluate((element) =>
      parseFloat(getComputedStyle(element).width),
    )
    await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    const paper = page.getByRole('img', { name: /open picnic cooler/ })
    await expect(paper).toHaveAttribute('data-progress', '1.0000')
    const dimensions = await paper.boundingBox()
    expect(dimensions!.width / dimensions!.height).toBeCloseTo(8.5 / 11, 2)
    expect(dimensions!.width).toBeCloseTo(closedWidth, 1)
    await page.screenshot({ path: testInfo.outputPath(`studio-open-${width}.png`), fullPage: true })
  })
}

test('keyboard opens and closes a focus-contained dialog and paper', async ({ page }) => {
  await page.goto('/')
  const help = page.getByRole('button', { name: 'How it works' })
  await help.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(help).toBeFocused()
  const open = page.getByRole('button', { name: 'Open the surprise', exact: true })
  await open.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Fold it back' })).toBeFocused()
})

test('fold lab compares templates and downloads a matching prototype', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Explore the folds/ }).click()
  await expect(page.getByRole('img', { name: /closed: bands 1 and 4/ })).toBeVisible()
  await page.getByRole('radio', { name: 'Equal thirds' }).check()
  await expect(page.getByRole('img', { name: /closed: band 1 visible/ })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download numbered sheet' }).click()
  expect((await downloadPromise).suggestedFilename()).toBe('thirds-fold-prototype-v1.svg')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('loading and error states recover after retry', async ({ page }) => {
  let fail = true
  await page.route('**/artworks/manifest.json', async (route) => {
    if (fail) await route.fulfill({ status: 503, body: 'Unavailable' })
    else await route.continue()
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Our paper got a little stuck.')
  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('button', { name: /Picnic cooler/ })).toBeVisible()
})

test('loading indicator respects reduced motion and grown-up preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/artworks/manifest.json', async (route) => {
    await pending
    await route.continue()
  })
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('Setting out the paper')
  await expect(page.locator('.loading-paper')).toHaveCSS('animation-name', 'none')
  release()
  await expect(page.getByRole('button', { name: /Picnic cooler/ })).toBeVisible()
  await page.getByRole('button', { name: 'For grown-ups' }).click()
  await page.getByRole('checkbox', { name: /Less movement/ }).check()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.getByRole('button', { name: 'Open the surprise', exact: true })).toHaveCSS(
    'transition-duration',
    '0s',
  )
})
