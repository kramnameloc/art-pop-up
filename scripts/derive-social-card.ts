import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

// A static sharing asset made from the studio's existing type, palette, and artwork.
// Run: node --experimental-strip-types scripts/derive-social-card.ts
const root = new URL('../', import.meta.url)
function dataUrl(path: string, type: string) {
  return `data:${type};base64,${readFileSync(new URL(path, root)).toString('base64')}`
}
const sans = dataUrl(
  'node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2',
  'font/woff2',
)
const serif = dataUrl(
  'node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff2',
  'font/woff2',
)
const italic = dataUrl(
  'node_modules/@fontsource/fraunces/files/fraunces-latin-500-italic.woff2',
  'font/woff2',
)
const closed = dataUrl('public/artworks/cozy-gift/thumbnail.svg', 'image/svg+xml')
const open = dataUrl('public/artworks/cozy-gift/master.svg', 'image/svg+xml')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face { font-family: Sans; src: url('${sans}'); }
    @font-face { font-family: Serif; src: url('${serif}'); }
    @font-face { font-family: Serif; src: url('${italic}'); font-style: italic; }
    * { box-sizing: border-box; }
    body { margin: 0; width: 1200px; height: 630px; background: #faf8f1; color: #303f35; font-family: Sans, sans-serif; }
    .copy { position: absolute; top: 60px; left: 60px; width: 550px; }
    .brand { display: flex; align-items: center; gap: 13px; font-family: Serif, serif; font-size: 34px; }
    .mark { display: grid; place-items: center; width: 48px; height: 50px; border-radius: 13px 13px 13px 4px; background: #bd4731; color: #fffaf4; }
    h1 { font: 500 70px/1.12 Serif, serif; letter-spacing: -2px; margin: 58px 0 24px; }
    h1 em { color: #bd4731; }
    p { font-size: 23px; line-height: 1.6; color: #62695b; margin: 0; }
    .footer { position: absolute; left: 60px; bottom: 48px; color: #456552; font-size: 18px; }
    .table { position: absolute; top: 36px; right: 30px; width: 540px; height: 558px; background-color: #eaf0e3; background-image: radial-gradient(#bfcdb4 1px, transparent 1px); background-size: 18px 18px; border: 1px solid #d9dfd0; border-radius: 28px; }
    figure { position: absolute; margin: 0; text-align: center; }
    figure img { display: block; background: white; box-shadow: 0 8px 22px #293d3524; }
    figcaption { margin-top: 19px; font-size: 17px; color: #526043; }
    .closed { left: 24px; top: 188px; transform: rotate(-7deg); }
    .closed img { width: 180px; }
    .open { right: 27px; top: 60px; transform: rotate(5deg); }
    .open img { width: 262px; }
    .spark { position: absolute; left: 80px; top: 67px; color: #aa8340; font-size: 64px; }
    .tag { position: absolute; left: 51px; bottom: 48px; background: #faf6df; border: 1px solid #b3ba96; padding: 13px 23px; border-radius: 9px; font-size: 18px; transform: rotate(-3deg); }
  </style></head><body>
    <div class="copy"><div class="brand"><span class="mark"><svg width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 4h11l5 7-5 9H4l5-9-5-7Zm5 7h11M4 4l5 7-5 9"/></svg></span>pop & paper.</div>
    <h1>A little fold.<br><em>A big surprise.</em></h1><p>Print it. Color it. Open the magic.<br>A little paper art studio for everyone.</p></div>
    <div class="table"><span class="spark">✳</span><figure class="closed"><img src="${closed}" alt="Folded gift box"><figcaption>A little fold…</figcaption></figure><figure class="open"><img src="${open}" alt="Open surprise"><figcaption>…a whole lot of wonder.</figcaption></figure><div class="tag">Made for little makers.</div></div>
    <div class="footer">fold.kramnameloc.com</div>
  </body></html>`)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((image) => image.decode()))
  })
  await page.screenshot({ path: fileURLToPath(new URL('public/social-card.png', root)) })
  console.log('Generated public/social-card.png (1200 × 630).')
} finally {
  await browser.close()
}
