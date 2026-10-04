# Picnic cooler — artwork brief and review

Authored and visually reviewed October 4, 2026 by Codex. Approved for the local software demo only. Human artwork sign-off and physical folding remain **pending**.

## Composition and provenance

- Closed: A smiling cooler with a handle and closed lid.
- Reveal: A smiling popsicle and strawberry, orange slice, beach ball, and stars.
- Original SVG paths authored for this repository. No external illustration, image API, bitmap tracing, or generated raster is embedded.
- Editable source and export: [`master.svg`](../../public/artworks/picnic-cooler/master.svg).
- Thumbnail: [`thumbnail.svg`](../../public/artworks/picnic-cooler/thumbnail.svg), generated with `npm run artwork:thumbnails`.
- Metadata: [`manifest.json`](../../public/artworks/manifest.json), record `picnic-cooler`.

## Geometry

US Letter, 612 × 792 points. Provisional `surprise` template, version 1. Creases at y=198 and y=396; closed front shows y=0–198 joined to y=594–792. The hidden illustration occupies y=198–594. The lid’s lower edge is y=198 with body anchors x=140 and x=472 at y=594. The face stays entirely in the lower visible band.

The normalized content bounds are x=0.08, y=0.06, width=0.84, height=0.88. These describe the illustration envelope, not a completed printer-margin layout. The SVG contains no printed guides, screen shadows, or embedded lettering.

## Visual review

The folded lid meets the body without exposing the snacks. The halfway state naturally conceals the upper snacks behind the lifted top panel; the face remains intact. The open composition has generous white space around each snack.

Reviewed at phone scale and as a 612 × 792 screen rendering. Bold rounded black outlines, white coloring areas, and a few solid eyes/dots remain clear. No brand marks, identifying details, or unsuitable motifs were found in agent review. All three paper panels display crops of this same master, and back-facing artwork is culled. Closed thumbnails follow the shared fold mapping.

See [closed](../../docs/screenshots/phase-2-picnic-cooler-closed.png), [halfway](../../docs/screenshots/phase-2-picnic-cooler-half.png), and [open](../../docs/screenshots/phase-2-picnic-cooler-open.png) review captures. [Phase 2 verification](../../docs/PHASE_2_VERIFICATION.md) records browser and physical limits.

## Pending before print approval

A human should review the pictures, print the numbered prototype, and confirm the fold mapping. Phase 3 must add printer margins and guides, then physically fold this master at Letter and A4 sizes and record seam accuracy. Do not claim that the screen review verifies real paper.
