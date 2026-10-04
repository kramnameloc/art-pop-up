# Cozy gift box — artwork brief and review

Authored and visually reviewed October 4, 2026 by Codex. Approved for the local software demo only. Human artwork sign-off and physical folding remain **pending**.

## Composition and provenance

- Closed: A small gift box with a bow and continuous central ribbon.
- Reveal: A waving rabbit, a friendly bear, two large stars, and simple party streamers.
- Original SVG paths authored for this repository. No external illustration, image API, bitmap tracing, or generated raster is embedded.
- Editable source and export: [`master.svg`](../../public/artworks/cozy-gift/master.svg).
- Thumbnail: [`thumbnail.svg`](../../public/artworks/cozy-gift/thumbnail.svg), generated with `npm run artwork:thumbnails`.
- Metadata: [`manifest.json`](../../public/artworks/manifest.json), record `cozy-gift`.

## Geometry

US Letter, 612 × 792 points. Provisional `surprise` template, version 1. Creases at y=198 and y=396; closed front shows y=0–198 joined to y=594–792. The hidden illustration occupies y=198–594. The ribbon edges at x=285 and x=327 run to y=198 and resume at y=594. The lid slightly overhangs the box at x=141 and x=471.

The normalized content bounds are x=0.08, y=0.06, width=0.84, height=0.88. These describe the illustration envelope, not a completed printer-margin layout. The SVG contains no printed guides, screen shadows, or embedded lettering.

## Visual review

The ribbon aligns across the closed join. Faces stay clear of that seam. The rabbit’s feet cross the physical midpoint crease and are partially concealed in the halfway view, as expected for artwork attached to the moving panels. Both animals are upright and complete when open.

Reviewed at phone scale and as a 612 × 792 screen rendering. Bold rounded black outlines, white coloring areas, and a few solid eyes/dots remain clear. No brand marks, identifying details, or unsuitable motifs were found in agent review. All three paper panels display crops of this same master, and back-facing artwork is culled. Closed thumbnails follow the shared fold mapping.

See [closed](../../docs/screenshots/phase-2-cozy-gift-closed.png), [halfway](../../docs/screenshots/phase-2-cozy-gift-half.png), and [open](../../docs/screenshots/phase-2-cozy-gift-open.png) review captures. [Phase 2 verification](../../docs/PHASE_2_VERIFICATION.md) records browser and physical limits.

## Pending before print approval

A human should review the pictures, print the numbered prototype, and confirm the fold mapping. Phase 3 must add printer margins and guides, then physically fold this master at Letter and A4 sizes and record seam accuracy. Do not claim that the screen review verifies real paper.
