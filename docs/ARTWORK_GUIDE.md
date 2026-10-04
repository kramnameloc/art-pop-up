# Folding surprise artwork instructions

Use this brief for manually authored demo artwork and, later, creator-assisted or in-app image generation. Its purpose is to produce one coherent coloring composition that works when folded, unfolded, and printed.

## Inputs

Before creating artwork, read the approved fold template and record the subject, closed-picture concept, interior surprise, template version, master dimensions, visible regions, reserved seam areas, and print bounds. Checkpoint 1A in [the implementation plan](PLAN.md) is still pending. Phase 2’s requested software demo uses provisional illustrated masters; do not finalize physical registration or claim print readiness until the real-paper check passes.

## Reusable creative instructions

Create an original, friendly black-and-white coloring illustration for an elementary-age child. Use bold, smooth, rounded outlines; cheerful faces; cozy playful objects; and spacious, easy-to-color shapes. Translate the requested Coco Wyo reference into these concrete visual qualities.

Use black linework on white paper. Keep interior coloring regions mostly white. Small solid eyes are fine. Avoid gray shading, gradients, hatching, heavy black backgrounds, photorealism, tiny clutter, embedded titles, lettering, watermarks, and branded packaging. The app adds labels and instructions separately.

The folded picture must read as a complete simple object. Opening the paper reveals a cheerful surprise belonging to that object. Keep the same object, proportions, and perspective across the entire master. Preserve all template seam anchors and protected regions exactly. Faces must remain readable in the intended state and must not be accidentally split by the closed-picture join.

Compose the surprise within the template's designated interior area. Keep its essential shapes away from protected seams and trim bounds. Do not invent crease positions, draw fold guides into the artwork, or paint drop shadows that belong to the virtual paper.

For the kid-facing catalog, choose welcoming animals, plants, food, toys, and imaginary places. Exclude frightening or adult themes, injuries, weapons, hateful imagery, unsafe activities, and personal information. Review the actual result; following these instructions is not proof that the output is suitable.

## Manual asset workflow

1. Start with the approved fold template, including seam markers on a separate guide layer.
2. Design the compact silhouette first. Map its upper and lower visible portions into the unfolded master using the template.
3. Draw the interior surprise, preserving the silhouette and anchor points. Prefer SVG paths for exact placement and scalable printing.
4. Render closed, intermediate, and expanded previews from that master. Do not draw an independent closed preview to hide alignment problems.
5. Review the composition at phone size and full print size. Correct seams, visual clutter, and overly small coloring regions.
6. Remove guide layers from the master export. Export thumbnails from the renderer and retain the editable source.
7. Add metadata and review status to the artwork manifest. Serve only approved assets.
8. During phase 3, print and physically fold the matching sheet before marking it print-verified.

Current per-artwork package:

```text
public/artworks/<id>/
  master.svg          # Or a reviewed high-resolution PNG
  thumbnail.svg       # Generated from the same master and closed-region mapping
artwork-sources/<id>/
  brief.md            # Concept, provenance, and review notes

public/artworks/manifest.json # Template, dimensions, descriptions, bounds, and review status
```

The exported master is also the editable vector source; there is no separate duplicate source file. The renderer crops this master onto three paper surfaces. `npm run artwork:thumbnails` derives the compact preview using `templates.surprise.closedVisible`; `npm run artwork:check` detects stale previews and runs in the standard check gate. Add a manifest record and assets to add another picture, with no concept branches in the renderer.

`approved-demo` means accepted for the local screen demo. `review.visual`, `review.human`, and `review.physical` distinguish agent review from human sign-off and actual folding. The three current records have agent visual review, pending human review, and pending physical verification. Do not relabel those pending checks without evidence.

Do not label a raster embedded inside an SVG as vector line art. Accept raster sources only when their final-size output is visually crisp.

## Example cooler brief

Closed picture: a rounded picnic cooler with a happy face, a simple lid, and large open coloring areas. The lid meets the body at the template's closed seam.

Expanded picture: the lid lifts away to reveal smiling strawberries, a popsicle, orange slices, and a small beach ball. Use a few stars and curved motion lines to suggest a playful burst. Keep the cooler body and face consistent. Leave enough white space for children to color each object.

For later AI-assisted creation, keep the cooler outline and seam-critical portions in the approved template. Request only the interior motifs in the reserved area, then composite them with code. A prompt cannot guarantee precise registration.

## Review checklist

- [ ] Closed view reads as a complete object and conceals the surprise.
- [ ] Open view reveals the intended idea with consistent outer artwork.
- [ ] Intermediate views keep art attached to its paper surface without unintended mirroring or clipping.
- [ ] Seam anchors, protected areas, template version, and master dimensions agree.
- [ ] Black outlines remain clear and coloring areas remain usable at print size.
- [ ] No unwanted text, brand marks, unsuitable details, or identifying information appear.
- [ ] Thumbnail and state-specific descriptions match the composition.
- [ ] A human has reviewed the final composition before catalog approval.
- [ ] Print readiness is recorded separately; physical folding has been checked when claimed.
