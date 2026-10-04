# Phase 1 verification

Verified October 4, 2026 on macOS with Node.js 26.7.0 and npm 11.19.0. Phase 1 software is implemented; checkpoint 1A remains open for physical folding.

## Completed checks

- Lockfile dependency installation: `npm ci --offline --cache /private/tmp/art-pop-up-npm-cache --no-audit --no-fund` passed using the dependency cache populated during setup. A new machine uses `npm ci` with registry access.
- `npm run check`: lint, 14 unit tests, TypeScript checking, and production build passed.
- `npm run test:e2e`: 8 Chromium browser tests passed.
- Visual review: closed views at 360, 768, and 1280 CSS pixels; expanded US Letter view at desktop size. Screenshots are generated in `test-results/` and retained examples are linked below.

Browser checks verify gallery selection, reset on selection, open/close/reset controls, no third-party requests, no page exceptions in the core journey, loading/error/retry behavior, keyboard activation, modal focus containment and restoration, reduced motion, prototype downloads, 44-pixel primary touch targets, and no horizontal overflow at all three viewport widths.

The unfolded SVG is 612 × 792; the surprise-folded SVG is 612 × 396. Browser assertions check the actual rendered unfolded ratio against 8.5/11 and verify that unfolding preserves the sheet width. Both templates and downloaded SVGs use the same canonical Letter dimensions.

The tested gallery views and fold-lab dialog report zero axe accessibility violations. Early contrast and dialog-focus issues were corrected before the passing run. Automated accessibility checks do not establish complete accessibility conformance.

## Review images

- [Desktop closed view](screenshots/phase-1-desktop.png)
- [Desktop unfolded US Letter view](screenshots/phase-1-unfolded.png)
- [Phone view](screenshots/phase-1-phone.png)
- [Tablet view](screenshots/phase-1-tablet.png)

## Remaining checks

- Physically print and fold both prototypes; record the result in [the fold contract](FOLD_CONTRACT.md).
- Real touch-device, Safari, and Firefox testing has not been performed. The current browser evidence is Chromium with resized viewports, not a physical-device test.
- Finished artwork, continuous folding animation, dragging, coloring-page export, and live AI are later phases.

The application serves reviewed concept placeholders. Their presence does not mark the phase 2 artwork checkpoints complete.
