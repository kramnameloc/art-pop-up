# Art Pop Up

A playful web app for folding surprise art, with a warm craft-table interface and US Letter paper proportions.

Phase 2 implements three original SVG surprises: a picnic cooler, a cozy gift box, and a tiny flower pot. Open and refold them with the button or pull tab, using a mouse, touch, or keyboard. Each picture uses one master across the gallery thumbnail, closed view, and animated paper panels. The unfolded sheet is exactly 8.5:11 (612 × 792 coordinates), with the same width in its open and closed views.

The fold lab, downloadable numbered prototypes, help, reduced-motion settings, and loading/error recovery remain available. The demos use the provisional surprise-fold template. Physical folding and human artwork sign-off are still pending; these are screen demos, not print-verified crafts. Coloring printouts and optional AI generation follow in phases 3 and 4.

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

Other commands: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run format`, `npm run build`, and `npm run preview`. The production output is in `dist/`.

## Project map

- `src/components/`: gallery, animated `FoldingPaper`, paper stage, fold lab, and dialogs.
- `src/hooks/useFold.ts`: interruptible animation and motion preferences.
- `src/domain/foldGeometry.ts`: continuous rigid-panel geometry.
- `src/domain/paper.ts`: the canonical US Letter dimensions.
- `src/domain/templates.ts`: normalized crease, panel, surface, and occlusion mappings.
- `src/domain/artworkRepository.ts`: loading and validation of the local manifest.
- `public/artworks/manifest.json`: demo metadata, state descriptions, and explicit review status.
- `public/artworks/<id>/`: editable vector master and derived closed thumbnail.
- `artwork-sources/<id>/brief.md`: provenance, seam anchors, and visual-review notes.
- `scripts/derive-thumbnails.ts`: generates thumbnails from the shared fold template.
- `tests/studio.spec.ts` and `tests/folding.spec.ts`: browser regression checks.

- [Implementation plan and checkpoints](docs/PLAN.md)
- [Reusable artwork instructions and review checklist](docs/ARTWORK_GUIDE.md)
- [Fold contract and physical check](docs/FOLD_CONTRACT.md)
- [Phase 1 verification evidence](docs/PHASE_1_VERIFICATION.md)
- [Phase 2 verification evidence](docs/PHASE_2_VERIFICATION.md)

The fold lab downloads geometric SVG test sheets. These are not the finished coloring-page exports planned for phase 3.

## Adding artwork

Create `public/artworks/<id>/master.svg` with the 612 × 792 viewBox and surprise v1 seam anchors, then add its metadata to `public/artworks/manifest.json`. Record provenance and review in `artwork-sources/<id>/brief.md`. Run `npm run artwork:thumbnails` and review the closed, intermediate, and open views before approving the demo. The renderer needs no concept-specific code. `npm run artwork:check` detects stale thumbnails. See the [artwork guide](docs/ARTWORK_GUIDE.md) for the complete workflow.
