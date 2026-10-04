import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function openPreview(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Print & color', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Print a little surprise' })).toBeVisible()
}

for (const width of [360, 768, 1280]) {
  test(`print preview is accessible and fits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    await openPreview(page)
    await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const dialog = page.getByRole('dialog')
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    )
    await expect(page.locator('.print-preview .print-page')).toHaveCount(2)
    await page.getByRole('radio', { name: /A4/ }).check()
    await page.getByRole('checkbox', { name: /calibration ruler/ }).check()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.screenshot({
      path: testInfo.outputPath(`print-preview-${width}.png`),
      fullPage: false,
    })
    await page.getByText('Read the folding directions', { exact: true }).click()
    await expect(page.locator('.print-help details')).toHaveAttribute('open', '')
    await page.getByText('Read the folding directions', { exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Print & color', exact: true })).toBeFocused()
  })
}

test('options, clean art, print invocation, and returning to play preserve the selected picture', async ({
  page,
}) => {
  await openPreview(page)
  await page.getByRole('radio', { name: /A4/ }).check()
  await page.getByRole('checkbox', { name: /Subtle fold guides/ }).uncheck()
  await page.getByRole('checkbox', { name: /Separate instruction sheet/ }).uncheck()
  await expect(page.locator('.print-preview .print-page')).toHaveCount(1)
  await expect(page.locator('.print-output .print-page')).toHaveCount(1)
  await expect(page.locator('.print-output .print-guides, .print-output .print-ruler')).toHaveCount(
    0,
  )
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printCalls = String(Number(document.body.dataset.printCalls ?? 0) + 1)
    }
  })
  await page.getByRole('button', { name: 'Print / Save as PDF' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-print-calls', '1')
  await page.getByRole('button', { name: 'Print / Save as PDF' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-print-calls', '2')
  await page.getByRole('button', { name: 'Back to playing' }).click()
  await page.getByRole('button', { name: /Cozy gift box/ }).click()
  // The browser's own Print command also gets the full current master without opening preview.
  await expect(page.locator('.print-output .print-master')).toHaveAttribute(
    'href',
    '/artworks/cozy-gift/master.svg',
  )
  await page.getByRole('button', { name: 'Print & color', exact: true }).click()
  await expect(page.getByRole('radio', { name: /A4/ })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: /Subtle fold guides/ })).not.toBeChecked()
  await page.getByRole('button', { name: 'Back to playing' }).click()
  await page.getByRole('button', { name: 'Open the surprise', exact: true }).click()
  await expect(page.locator('.stage-section')).toHaveAttribute('data-fold-state', 'open')
})

test('print media removes the studio, modal, shadows, and optional instruction page', async ({
  page,
}) => {
  await openPreview(page)
  await page.getByRole('checkbox', { name: /Separate instruction sheet/ }).uncheck()
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#root')).toBeHidden()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('.print-output')).toBeVisible()
  await expect(page.locator('.print-output .print-page')).toHaveCount(1)
  await expect(page.locator('.print-output .print-page')).toHaveCSS('box-shadow', 'none')
  const pageBox = (await page.locator('.print-output .print-page').boundingBox())!
  expect(pageBox.width).toBeCloseTo(8.5 * 96, 1)
  expect(pageBox.height).toBeCloseTo(11 * 96, 1)
  await page.emulateMedia({ media: 'screen' })
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.print-output')).toBeHidden()
})

test('all demos use the same master, template, and positions in preview and print; export PDF evidence', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/')
  for (const [title, id] of [
    ['Picnic cooler', 'picnic-cooler'],
    ['Cozy gift box', 'cozy-gift'],
    ['Tiny flower pot', 'tiny-garden'],
  ]) {
    await page.getByRole('button', { name: new RegExp(title) }).click()
    const master = await page.locator('.panel-front image').first().getAttribute('href')
    await page.getByRole('button', { name: 'Print & color', exact: true }).click()
    await page.getByRole('checkbox', { name: /calibration ruler/ }).check()
    for (const paper of ['US Letter', 'A4']) {
      await page.getByRole('radio', { name: new RegExp(paper) }).check()
      const preview = page.locator('.print-preview .print-pages')
      const output = page.locator('.print-output .print-pages')
      expect(await preview.innerHTML()).toBe(await output.innerHTML())
      await expect(output).toHaveAttribute('data-template', 'surprise-v1')
      await expect(output).toHaveAttribute('data-artwork', id)
      await expect(output.locator('.print-master').first()).toHaveAttribute('href', master!)
      if (browserName === 'chromium') {
        await page.pdf({
          path: testInfo.outputPath(`${id}-${paper === 'A4' ? 'a4' : 'letter'}.pdf`),
          preferCSSPageSize: true,
          printBackground: false,
          displayHeaderFooter: false,
        })
      }
    }
    await page.getByRole('button', { name: 'Back to playing' }).click()
  }
  if (browserName === 'chromium') {
    await page.getByRole('button', { name: 'Print & color', exact: true }).click()
    for (const name of [/Subtle fold guides/, /calibration ruler/, /Separate instruction sheet/])
      await page.getByRole('checkbox', { name }).uncheck()
    await page.pdf({
      path: testInfo.outputPath('tiny-garden-a4-clean.pdf'),
      preferCSSPageSize: true,
      printBackground: false,
      displayHeaderFooter: false,
    })
    await page.getByRole('button', { name: 'Back to playing' }).click()
    await page.pdf({
      path: testInfo.outputPath('tiny-garden-a4-direct-print.pdf'),
      preferCSSPageSize: true,
      printBackground: false,
      displayHeaderFooter: false,
    })
  }
})
