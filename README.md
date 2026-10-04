# Art Pop Up

A playful web app for folding surprise art, with a warm craft-table interface and US Letter paper proportions.

Phase 1 implements the web harness: three selectable concept placeholders, open/closed paper projections, a fold comparison lab, downloadable numbered prototypes, help, motion settings, and loading/error recovery. The unfolded sheet is exactly 8.5:11 (612 × 792 coordinates), with the same width in its open and closed views.

Finished surprise artwork and folding animation are phase 2. Coloring printouts and AI generation follow in phases 3 and 4. The fold template still needs physical verification before final artwork is authored.

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
npx playwright install chromium
npm run test:e2e
```

`check` runs lint, unit tests, TypeScript checking, and a production build. Browser checks cover selection, paper proportions, 360/768/1280-pixel layouts, accessible controls and dialogs, reduced motion, downloads, and failed-request recovery. Browser installation is needed only once per Playwright browser version.

Other commands: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run format`, `npm run build`, and `npm run preview`. The production output is in `dist/`.

## Project map

- `src/components/`: gallery, paper renderer, fold lab, and dialogs.
- `src/domain/paper.ts`: the canonical US Letter dimensions.
- `src/domain/templates.ts`: normalized crease, panel, surface, and occlusion mappings.
- `src/domain/artworkRepository.ts`: loading and validation of the local manifest.
- `public/artworks/manifest.json`: the three approved concept placeholders.
- `tests/studio.spec.ts`: browser regression checks.

- [Implementation plan and checkpoints](docs/PLAN.md)
- [Reusable artwork instructions and review checklist](docs/ARTWORK_GUIDE.md)
- [Fold contract and physical check](docs/FOLD_CONTRACT.md)
- [Phase 1 verification evidence](docs/PHASE_1_VERIFICATION.md)

The fold lab downloads geometric SVG test sheets. These are not the finished coloring-page exports planned for phase 3.
