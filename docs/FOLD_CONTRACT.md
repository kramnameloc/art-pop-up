# Phase 1 fold contract

Status: geometry and screen projections verified; physical folding pending. The surprise fold is the provisional default. Both templates remain available under **Explore the folds** in the app.

The canonical sheet is portrait US Letter: **8.5 × 11 inches**, represented by **612 × 792 points**. Both dimensions use the same scale, so the unfolded width/height ratio is exactly 17/22. The renderer keeps the paper's width unchanged when switching between closed and open states.

Coordinates below are normalized to the full sheet. `y = 0` is the top, `y = 1` the bottom. Mountain/valley directions are viewed from the printed front. The code records physical panels separately from visible artwork bands.

## Surprise fold

Two creases occur at 25% and 50% of the sheet height: **2.75 and 5.5 inches from the top**. The first is a valley fold; the second is a mountain fold. Start with the top half folded behind at the midpoint, then bring the first quarter forward at the upper crease.

| Physical panel | Unfolded y range | Closed world y range | Face toward viewer | Layer |
| --- | --- | --- | --- | --- |
| Top | 0–0.25 | 0.5–0.75 | Front | Top |
| Hinge | 0.25–0.5 | 0.75–0.5, reversed | Back | Middle |
| Base | 0.5–1 | 0.5–1 | Front | Bottom |

The closed picture shows original regions **0–0.25** and **0.75–1** together. The hidden interval is **0.25–0.75**; it spans the hinge and the concealed portion of the base. The closed sheet measures **8.5 × 5.5 inches**.

Four numbered bands make this visible: bands 1 and 4 meet in the closed view, while 2 and 3 are hidden. The printed seam markers at the bottom of band 1 and top of band 4 should align.

## Equal thirds

Two creases occur at 1/3 and 2/3 of the sheet height: approximately **3.667 and 7.333 inches from the top**. The upper crease is a valley fold; the lower crease is a mountain fold.

| Physical panel | Unfolded y range | Closed world y range | Face toward viewer | Layer |
| --- | --- | --- | --- | --- |
| Top | 0–1/3 | 2/3–1 | Front | Top |
| Hinge | 1/3–2/3 | 1–2/3, reversed | Back | Middle |
| Base | 2/3–1 | 2/3–1 | Front | Bottom |

Only original band 1 is visible from the front. The closed sheet measures **8.5 × 11/3 inches**. This comparison demonstrates why three equal physical panels do not expose the same two artwork regions as the surprise fold.

## Physical verification

1. Open the fold lab and download each numbered SVG. It declares an exact 8.5 × 11-inch page.
2. Print on Letter paper at actual size, with no browser headers/footers. If the printer scales the image down, trim to its outside border and measure the folds within that border; record the scaling rather than claiming a full-size test.
3. Follow the on-screen fold order. For a full-size surprise sheet, crease at 2.75 and 5.5 inches from the top. For equal thirds, divide the full height into thirds.
4. Confirm that surprise bands 1 and 4 meet, whereas equal thirds shows only band 1. Record whether seam markers match, the printer settings, the sheet dimensions, and the date.
5. Reopen each sheet and compare it with the lab's expanded view. Record which template reproduces the intended reference behavior.

No physical test has been performed. Final artwork registration remains gated on that check. These SVGs are geometric prototypes. Phase 3 adds separate coloring-page exports with printer margins, described below.

## Phase 3 print placement

`src/domain/printLayout.ts` preserves the complete 612 × 792 master and scales both axes uniformly. The fitting rectangle leaves at least 36 points (12.7 mm) horizontally and 60 points vertically around the master; extra vertical space keeps the optional calibration ruler separate from the artwork. The master is centered on the physical page. Options never change its scale or position.

For page width `W` and height `H`, use `s = min((W - 72) / 612, (H - 120) / 792)`, `x = (W - 612s) / 2`, and `y = (H - 792s) / 2`. A normalized crease `c` prints at `y + c × 792s`. The same transform places the art and guides. `foldOrder` in the existing template numbers the lower mountain crease first and upper valley crease second; no geometry revision was made.

| Paper | Fold 1: back, from flat page top | Fold 2: forward, from flat page top |
| --- | --- | --- |
| US Letter | 139.7 mm / 5.50 in | 80.4 mm / 3.17 in |
| A4 | 148.5 mm / 5.85 in | 88.8 mm / 3.50 in |

These are the coloring-page positions, not the full-bleed fold-lab prototype positions above. Keep the entire physical sheet; do not trim the margins. The fold at the centered midpoint maps the upper artwork seam onto the lower seam after the second fold. Unit tests independently check this reflection in page coordinates. White paper extending past the master changes the outside blank margins of the closed craft but not the artwork registration.

Print at actual size with matching paper, no additional browser margins, and headers/footers off. Measure the optional 50 mm ruler and record any driver scaling. The [Phase 3 worksheet](PHASE_3_VERIFICATION.md#physical-fold-and-family-review-worksheet) requires physical testing for all six artwork/paper combinations; mathematical registration is not physical evidence.

## Implementation boundaries

`src/domain/paper.ts` owns the page dimensions. `src/domain/templates.ts` owns creases, panel orientation, stacking, and visible source regions. `PaperSurface` crops the same master according to those regions; it does not swap between separately authored closed and open images.

Phase 2 adds continuous folding in `src/domain/foldGeometry.ts` and `FoldingPaper`. The hinge rotates from 180° to 0° about the base; the top translates with its connected edge while staying front-facing. Panel lengths stay fixed, the paper width stays fixed, and its projected height changes from half a sheet to a full sheet. Back faces are plain paper. Explicit face culling, back-to-front painting, layer indices, and tiny depth offsets preserve the template’s occlusion at the coplanar endpoints across browser engines.

The gallery thumbnail generator uses the same template’s closed-visible mapping. Neither closed views nor thumbnails use independently drawn artwork. Automated tests check connected edges throughout the motion and independently project closed stacked panels, but cannot substitute for a real sheet.
