# Manual SVG workflow verification

Verified October 4, 2026. Manual imports use the existing provisional surprise v1 fold template; this does not close physical folding or family usability checkpoints.

## Delivered flow

**Add image → Describe → Copy prompt → Import & preview → Save to my pictures.** The scene prompt requests an entire SVG inside one fenced `svg` code block, with nothing outside it, so ChatGPT's Copy code action captures the complete file. Art direction describes original Coco Wyo-inspired cozy coloring art, polished contours, expressive characters, balanced composition, consistent outlines, spacious coloring areas, and a final quality pass. The prompt includes exact visible bands and seam positions from the shared fold template. An existing SVG can skip the prompt steps.

File upload and pasted XML both go through inert parsing, a static-vector allowlist, size/complexity limits, paper fitting, and image decoding before preview. Unsupported SVG is rejected with an actionable message. The user reviews folded and open views before saving. SVGs and their names/scene descriptions persist in versioned local storage; the current master powers gallery, fold animation, and printing.

## Checks and evidence

- `npm run check`: passed after the final prompt revision. ESLint, 28 unit tests, existing thumbnail freshness checks, TypeScript, and the production build passed.
- `npm run test:e2e -- tests/manual-artwork.spec.ts --project=chromium --project=webkit --workers=2 --output=test-results/manual-final`: **18 passed**. Covers prompt copying and unavailable-clipboard fallback, fenced SVG paste, file upload, dimension fitting, stale-preview invalidation, invalid/active SVG rejection, storage quota retry, corrupt collection preservation/reset, save/reload/remove, cross-tab updates, fold/Letter/A4 parity, and no external HTTP requests in the manual journey.
- Responsive and axe checks passed at 360, 768, and 1280 CSS pixels in Chromium and WebKit. Screenshots are under `test-results/manual-final/`. Desktop and phone folded/open import previews were visually reviewed: readable controls, complete artwork, no horizontal overflow, and matching closed/open compositions. Keyboard focus remains inside the modal and returns to Add image.
- Existing studio/folding/printing regression tests: **45 passed, 1 skipped** (the existing Chromium-only simulated-touch test) in `test-results/manual-regression/`. That combined run exposed an asynchronous focus transition that could interrupt a fast paste in WebKit. The transition now moves focus synchronously, and all 18 manual tests passed on the final run.
- The example SVG used for import verification is the existing gift-box demo, imported through the same boundary as an external file; browser tests do not certify generated artwork quality.

## Pages and sharing

The requested GitHub Pages workflow builds and validates on `main`, uploads `dist/`, and deploys with separate Pages/OIDC permissions. YAML syntax, trigger, build dependency, artifact path, and permissions were checked locally. Official action versions were checked against their published metadata. No workflow was pushed or run remotely during this task.

Read-only repository verification found `main` as the default branch, Pages publishing source `workflow`, and custom domain `fold.kramnameloc.com`. HTTPS enforcement was off. The existing root-path Vite configuration is appropriate for that domain. Hosting changes are limited to workflow, document-head metadata, static crawler files, and the social card; the visible app was not redesigned for hosting.

The built HTML's canonical and social URLs, PNG dimensions (1200 × 630), sitemap, and robots file were checked. The sharing PNG was rendered from existing artwork and local fonts and visually reviewed. To reproduce it, run `node --experimental-strip-types scripts/derive-social-card.ts` with Playwright Chromium installed.

## Remaining manual verification

- The revised prompt has not been evaluated against a fresh ChatGPT response in this task. Formatting, SVG quality, and seam accuracy still depend on the returned result and should be reviewed before saving.
- Physical folding, installed Safari, real touch devices, native print dialogs, and Firefox remain outside this verification. The earlier Firefox launch limitation is recorded in the prior phase evidence.
- Saving is local to the browser and origin, not cloud backup or a share link for individual SVGs. Social metadata shares the studio URL.
- Remote Pages deployment, DNS/certificate status, and platform-specific social crawler previews await publication.
