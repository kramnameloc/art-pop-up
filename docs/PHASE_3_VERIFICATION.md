# Phase 3 verification

Implemented and reviewed October 4, 2026 on macOS with Node.js 26.7.0 and npm 11.19.0. The print software and Chromium PDF export checks are complete. Physical folding, family usability, and human artwork review remain pending. Checkpoints 3A and 3B are complete within the browser scope below; 3C and 3D remain open.

## Implemented

- **Print & color** opens a responsive grown-up preview from the paper stage or grown-up dialog. US Letter and A4 are supported in portrait orientation.
- The expanded SVG master is uniformly scaled and centered within conservative printer margins. The same `PrintLayout` component renders screen previews and browser print pages. Print output never captures animated paper panels.
- Numbered, subtle fold guides use the same placement transform as the artwork and the template’s fold order. The optional 50 mm ruler stays at physical page scale. Turning options on or off does not move or rescale the art.
- Clean artwork is available by disabling guides and the ruler. An optional second page provides printing guidance, numbered fold directions, a diagram, and the derived closed thumbnail. Equivalent folding directions are available as accessible HTML below the preview.
- **Print / Save as PDF** calls the browser’s print function. The browser menu also prints the selected master with the current options while preview is closed. Print CSS removes the studio, dialog/backdrop, controls, and screen shadows. Settings persist across picture changes until refresh.
- Both the preview and instruction sheet identify these as trial prints. The geometry is still surprise v1, and all original pending human/physical review metadata is unchanged.

No runtime dependency, backend, credentials, deployment, or dedicated PDF download service was added. Assets remain SVG-only, so raster effective-resolution checks do not apply to this release.

## Validation evidence

| Check | Result |
| --- | --- |
| `npm run check` | Pass: ESLint, 26 unit tests, thumbnail freshness, TypeScript, production build |
| `npx prettier --check src tests scripts vite.config.ts playwright.config.ts eslint.config.js index.html` | Pass |
| `npm run test:e2e -- --project=chromium --project=webkit --workers=1 --output=test-results/phase-3-verification` | 45 passed, 1 intentional WebKit skip for the existing Chromium CDP touch test |
| `python3 scripts/verify-print-pdfs.py test-results/phase-3-verification` | Pass for all 8 PDFs / 14 pages; used the bundled Python environment with pdfplumber |
| `git diff --check` | Pass |

The print browser tests cover all three masters on both paper sizes, exact preview/output markup parity, template revision, optional instructions, clean art, repeat print-button invocation, returning to play, and preserving paper preferences when selecting another picture. Print-media checks also run in WebKit. Keyboard containment and focus restoration pass, and axe reports zero violations for print previews at 360, 768, and 1280 CSS pixels. These automated results are not a complete accessibility audit.

The unit tests check uniform scaling, centering, safe bounds, actual paper units, and the independent reflection of the upper seam around the folded crease onto the lower seam. They specifically reject treating the upper crease as one quarter of the margin-fitted physical page. See the [print placement contract](FOLD_CONTRACT.md#phase-3-print-placement) for measurements.

The first browser run found that WebKit does not focus a pointer-clicked print button by default. The print trigger now explicitly focuses itself before opening the dialog, giving the dialog a reliable return target. A complete browser run passed after that correction. PDF review also led to larger guide numbers in the instruction diagram and extra space below the ruler/footer to keep all marks within the safe margins.

## PDF and visual review

Chromium generated Letter and A4 PDFs for the cooler, gift box, and flower pot with guides, ruler, and instructions enabled. Additional A4 exports cover clean art without instructions, and the same clean art printed with the preview closed. Those last two exports render identically at 96 dpi.

All eight PDFs passed checks for:

- Exactly two pages when instructions are enabled, otherwise one; no trailing blank pages.
- US Letter or A4 page dimensions. Letter is exactly 612 × 792 points. Chromium rounds A4 to 594.95996 × 841.91998 points, within 0.12 mm of nominal A4; the verification tolerance is 0.5 point (0.18 mm).
- Vector paths and zero raster image objects on every page. The browser preserves SVG artwork and diagrams as vectors.
- Visible paths and text inside the 36-point (12.7 mm) margins, allowing 0.5 point for export rounding.
- A 50 mm calibration line within 0.01 mm in the PDF, and correct transformed crease measurements in the instructions.
- No studio controls or browser URL headers. Clean art has no text, guides, or calibration ruler.

Poppler rendered the PDFs at 96 dpi for full-page visual review. All six art pages and corresponding instruction pages were inspected, along with clean art. No clipping, page shadows, overlapping text, broken glyphs, or distorted illustrations were found. PDF files and full review renders are reproducible under ignored `test-results/`; representative images are retained below.

| View | Evidence |
| --- | --- |
| Print preview | [Phone](screenshots/phase-3-preview-phone.png), [tablet](screenshots/phase-3-preview-tablet.png), [desktop](screenshots/phase-3-preview-desktop.png) |
| Letter PDF render | [Coloring page](screenshots/phase-3-letter-art.png), [instructions](screenshots/phase-3-letter-instructions.png) |
| A4 PDF render | [Coloring page](screenshots/phase-3-a4-art.png), [instructions](screenshots/phase-3-a4-instructions.png) |

Printing uses standard print media styles and `@page` sizing; the native print dialog remains under browser/printer control. See [MDN printing guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing) and [`@page` size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40page/size). The app tells the adult to choose matching paper, portrait, 100% / Actual size, single-sided output, no additional margins, and headers/footers off.

## Remaining browser and hardware checks

- **Firefox:** a targeted print test was attempted again with `--project=firefox --grep 'options, clean art'`. Firefox still exits before page load with “Could not find profile folder.” Its project remains enabled, and no Firefox print behavior is claimed as verified.
- **Native print dialogs:** browser print invocation was intercepted in interaction tests, and Chromium’s headless print renderer produced the PDFs. Native Chrome/Safari/Firefox dialogs, operating-system PDF destinations, and printer-driver overrides have not been manually tested.
- **Safari and touch hardware:** Playwright WebKit passed, but installed Safari, iOS/AirPrint, and real touch devices remain unverified.
- **Physical registration:** digital math, raster review, and PDF measurements cannot establish how paper thickness, crease placement, or printer scaling affect the join.

## Physical-fold and family-review worksheet

For each row, print with guides, calibration ruler, and instructions. Use the matching paper and actual-size settings. Confirm the ruler measures 50 mm, color the open art, and keep the whole sheet without trimming. Make fold 1 backward and fold 2 forward at the listed distances. Measure the largest mismatch where the compact picture joins; the target is at most 2 mm. Open and refold several times, checking that the intended interior stays concealed when closed and appears when opened.

Record the date, printer/browser, scaling setting, ruler length, seam error, and result here. A photo may be useful, but is not a substitute for measured results. No row has been physically tested in this session.

| Artwork | Paper | Date / printer / browser | Ruler / seam error | Result |
| --- | --- | --- | --- | --- |
| Picnic cooler | Letter | Pending | Pending | Pending |
| Picnic cooler | A4 | Pending | Pending | Pending |
| Cozy gift box | Letter | Pending | Pending | Pending |
| Cozy gift box | A4 | Pending | Pending | Pending |
| Tiny flower pot | Letter | Pending | Pending | Pending |
| Tiny flower pot | A4 | Pending | Pending | Pending |

For family usability, have an adult and child choose a picture, print, color, fold, and repeat the reveal using the supplied directions. Record which step needed extra explanation, whether fold numbering and direction were clear, whether controls or print settings caused confusion, and whether coloring areas were comfortable. Record feedback without personal identifying details. Correct confusing instructions and repeat the affected checks before closing 3D.

Do not mark the whole phase complete or enable live generation on the strength of automated export checks alone.
