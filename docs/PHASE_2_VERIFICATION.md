# Phase 2 verification

Implemented and reviewed October 4, 2026 on macOS with Node.js 26.7.0 and npm 11.19.0. Phase 2's screen experience is implemented. Physical template verification, human artwork sign-off, and some browser/device checks remain open.

## Implemented

- Three original editable SVG masters: picnic cooler, cozy gift box, and tiny flower pot. No image generation service or credentials are used at runtime.
- Each master is 612 × 792 points. Its closed view joins the top quarter to the bottom quarter, using provisional surprise v1 geometry. Thumbnails are generated from the master and the same fold mapping.
- Connected top, hinge, and base surfaces support closed, opening, open, and closing states. The sheet keeps its width and changes its projected height. Explicit face culling and layer order keep the interior concealed when closed in both tested engines. Creases and shadows are screen-only.
- Button, mouse, keyboard, and simulated touch controls; clamped dragging, midpoint snapping, tap-to-toggle, reset, reversal, and reset on picture changes. Pointer cancellation, lost capture, Escape, blur, visibility changes, and resize return a drag to its previous target state.
- Device and grown-up reduced-motion settings skip automatic animation. Descriptions announce the revealed objects only after opening; intermediate states do not spell out the surprise.
- Manifest and image validation/loading with timeout, cancellation, and retry. Master or thumbnail failures show the collection error instead of broken artwork.

## Validation evidence

- `npm run check` — passed: ESLint, 19 unit tests, thumbnail freshness, TypeScript, and production build.
- `npm run test:e2e -- --project=chromium --project=webkit --workers=1 --output=test-results/final-verification` — 33 passed, one intentional skip. The Chromium-specific CDP touch gesture test is skipped in WebKit; ordinary pointer and keyboard coverage runs in both engines.
- All three artworks have closed/intermediate/open captures in both engines. Browser assertions inspect painted pixels, compare each closed paper image with its generated thumbnail using tolerant black-line masks, and verify the panel assets all point to the same master. This caught and fixed WebKit face visibility and coplanar stacking issues that ARIA-only checks did not detect.
- Mouse snapping in both directions, clamped overshoot, pointer cancel/lost capture, Escape, resize, blur, rapid repeated input, selection/reset during animation, and changes to reduced motion passed.
- Chromium touch drag and touch tap passed through browser touch-event dispatch. This is simulated touch, not a physical-device result.
- Layout checks at 360, 768, and 1280 CSS pixels passed with no horizontal overflow, at least 44-pixel visible button targets, preserved width, and exact 8.5:11 open-sheet proportions.
- Zero axe violations in tested gallery, expanded artwork, and fold-lab views. Keyboard dialog focus/restoration and paper controls passed. Automated checks are not a complete accessibility audit.
- Manifest, master SVG, and thumbnail SVG failure/retry checks passed. The core selection/open/reset journey had no third-party requests or page exceptions. A fourth manifest entry works without modifying the renderer.

Browser tests use their own Vite server on port 4173. An earlier run reused an existing dev server with stale optimized dependency URLs; isolating the test server avoids that source of blank-page failures. Two animation assertions also timed out during a concurrent run; both passed in isolation, and the final serial run is the recorded evidence.

## Visual review

Agent review covered all masters at 612 × 792 screen pixels, closed and halfway projections, and phone/tablet/desktop layouts. The SVGs contain black and white vector shapes, generous coloring areas, no lettering or branding, and no guide or shadow baked into the master. Review notes and seam anchors live with each asset in `artwork-sources/`.

| Picture | Closed | Halfway | Open |
| --- | --- | --- | --- |
| Picnic cooler | [View](screenshots/phase-2-picnic-cooler-closed.png) | [View](screenshots/phase-2-picnic-cooler-half.png) | [View](screenshots/phase-2-picnic-cooler-open.png) |
| Cozy gift box | [View](screenshots/phase-2-cozy-gift-closed.png) | [View](screenshots/phase-2-cozy-gift-half.png) | [View](screenshots/phase-2-cozy-gift-open.png) |
| Tiny flower pot | [View](screenshots/phase-2-tiny-garden-closed.png) | [View](screenshots/phase-2-tiny-garden-half.png) | [View](screenshots/phase-2-tiny-garden-open.png) |

Retained captures use Chromium. Additional layout captures: [phone](screenshots/phase-2-phone.png), [tablet](screenshots/phase-2-tablet.png), and [desktop](screenshots/phase-2-desktop.png). WebKit captures are regenerated in the Playwright output directory.

## Remaining checks

- **Physical fold contract:** no paper prototype has been physically folded in this session. Checkpoint 1A and the physical portion of 2A remain pending. Screen alignment is not proof of paper alignment.
- **Human review:** `approved-demo` records agent review for the local software demo. Each manifest record explicitly retains pending human and physical review. A human has not signed off in this session.
- **Firefox:** the installed Playwright Firefox 155.0 build exits before page load with `Could not find profile folder`. The failure also occurs with `/private/tmp` and an explicitly created, confirmed-existing persistent profile. No Firefox app behavior is claimed as verified. The Firefox project stays enabled; `npm run test:e2e` includes it.
- **Safari and real touch:** Playwright WebKit 26.6 was checked; this is not an installed Safari or iOS-device check. A real touchscreen and installed Safari still need verification.
- **Printing:** no print layout, PDFs, or physical coloring crafts are delivered by Phase 2. Validate Letter/A4 margins and actual folds in Phase 3 before approving print readiness.
