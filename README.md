# Art Pop Up

A playful web app for folding surprise art, with a warm craft-table interface and US Letter paper proportions.

Phase 2 implements three original SVG surprises: a picnic cooler, a cozy gift box, and a tiny flower pot. Open and refold them with the button or pull tab, using a mouse, touch, or keyboard. Each picture uses one master across the gallery thumbnail, closed view, and animated paper panels. The unfolded sheet is exactly 8.5:11 (612 × 792 coordinates), with the same width in its open and closed views.

Phase 3 adds an adult-friendly **Print & color** preview for US Letter and A4, optional fold guides, a 50 mm calibration ruler, and a separate instruction sheet. The browser prints the expanded vector master, using the same placement as the preview. Choose **Print / Save as PDF** to open the browser’s print dialog.

The fold lab, downloadable numbered prototypes, help, reduced-motion settings, and loading/error recovery remain available. The demos use the provisional surprise-fold template. Physical folding, family usability, and human artwork sign-off are still pending, so the printouts are labeled as trials. Optional AI generation remains Phase 4.

## Run locally

Use Node.js 22.12 or newer and npm. No API key or backend is needed.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally http://127.0.0.1:5173. Fonts and the picture manifest are served locally; the running app makes no third-party requests.

## Development checks

```sh
npm run check
npx playwright install chromium firefox webkit
npm run test:e2e
```

`check` runs lint, unit tests, thumbnail freshness, TypeScript checking, and a production build. Browser projects cover Chromium, Firefox, and WebKit. Tests exercise all three artworks, rapid reversals, drag snapping/cancellation, resize, keyboard, simulated touch, reduced motion, accessibility, 360/768/1280-pixel layouts, and manifest/image failure recovery. Browser installation is needed only once per Playwright browser version.

Run a subset with `npm run test:e2e -- --project=chromium --project=webkit`. Firefox currently fails to launch in the verification environment with “Could not find profile folder”; its project remains enabled so that gap stays visible. See [Phase 2 evidence](docs/PHASE_2_VERIFICATION.md) for exact results and device limits.

Print tests also cover preview/output parity, Letter/A4, clean art, optional instructions, focus restoration, and print-only styles. Chromium creates eight PDF review files. For export verification:

```sh
npm run test:e2e -- tests/printing.spec.ts --project=chromium --project=webkit --workers=1 --output=test-results/phase-3-print
python3 scripts/verify-print-pdfs.py test-results/phase-3-print
```

The Python audit requires `pdfplumber` in the authoring environment (`python3 -m pip install pdfplumber`); it is not an application dependency. Render those PDFs with Poppler (`pdftoppm -r 96 -png input.pdf output-prefix`) and inspect them as well. [Phase 3 evidence](docs/PHASE_3_VERIFICATION.md) records the results and remaining manual checks.

Other commands: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run format`, `npm run build`, and `npm run preview`. The production output is in `dist/`.

## Project map

- `src/components/`: gallery, animated `FoldingPaper`, paper stage, fold lab, dialogs, and shared `PrintLayout` / `PrintPreview`.
- `src/hooks/useFold.ts`: interruptible animation and motion preferences.
- `src/domain/foldGeometry.ts`: continuous rigid-panel geometry.
- `src/domain/paper.ts`: the canonical US Letter dimensions.
- `src/domain/printLayout.ts`: paper sizes, conservative margins, uniform placement, transformed guides, and crease measurements.
- `src/domain/templates.ts`: normalized crease, panel, surface, and occlusion mappings.
- `src/domain/artworkRepository.ts`: loading and validation of the local manifest.
- `public/artworks/manifest.json`: demo metadata, state descriptions, and explicit review status.
- `public/artworks/<id>/`: editable vector master and derived closed thumbnail.
- `artwork-sources/<id>/brief.md`: provenance, seam anchors, and visual-review notes.
- `scripts/derive-thumbnails.ts`: generates thumbnails from the shared fold template.
- `tests/studio.spec.ts`, `tests/folding.spec.ts`, and `tests/printing.spec.ts`: browser regression checks and PDF generation.
- `scripts/verify-print-pdfs.py`: optional PDF page, margin, vector, ruler, and annotation audit.

- [Implementation plan and checkpoints](docs/PLAN.md)
- [Reusable artwork instructions and review checklist](docs/ARTWORK_GUIDE.md)
- [Fold contract and physical check](docs/FOLD_CONTRACT.md)
- [Phase 1 verification evidence](docs/PHASE_1_VERIFICATION.md)
- [Phase 2 verification evidence](docs/PHASE_2_VERIFICATION.md)
- [Phase 3 verification evidence and physical-test worksheet](docs/PHASE_3_VERIFICATION.md)

## Print, color, and fold

Choose a picture, open **Print & color**, and select the paper that is loaded in your printer. Enable guides for the first trial and optionally add the ruler and instructions. For a clean coloring page, disable guides and the ruler; disable instructions for a single-page export.

In the browser’s print dialog, select the matching paper size, portrait, single-sided, and **100% / Actual size**, with no additional margins or browser headers/footers. Safe margins are built into the page. Select **Save as PDF** as the destination for a file; no dedicated PDF download library is needed.

Keep the entire sheet, without trimming. Fold at the numbered guides, in numerical order, or mark the distances listed in the directions before folding. Do not divide the physical page into quarters: the artwork has been scaled and centered within printer margins. A separate instruction sheet and accessible on-screen directions give the corresponding measurements. Printing through the browser menu also uses the current artwork and chosen print options, even when the preview is closed.

## Adding artwork

Create `public/artworks/<id>/master.svg` with the 612 × 792 viewBox and surprise v1 seam anchors, then add its metadata to `public/artworks/manifest.json`. Record provenance and review in `artwork-sources/<id>/brief.md`. Run `npm run artwork:thumbnails` and review the closed, intermediate, and open views before approving the demo. The renderer needs no concept-specific code. `npm run artwork:check` detects stale thumbnails. See the [artwork guide](docs/ARTWORK_GUIDE.md) for the complete workflow.
