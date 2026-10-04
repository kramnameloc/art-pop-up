# Art Pop Up implementation plan

Build a child-friendly folding surprise art app in four independently reviewable phases. The first useful release lets a child choose original black-and-white artwork and unfold it on screen. Printing follows; live AI generation is an optional addition after the paper mechanism works.

Planning baseline: October 4, 2026. This repository initially contained only an untracked `.gitignore`. Phases 1–3 have software implementations in React, TypeScript, and Vite. Physical verification of the fold contract remains pending. See [Phase 1 evidence](PHASE_1_VERIFICATION.md), [Phase 2 evidence](PHASE_2_VERIFICATION.md), and [Phase 3 evidence](PHASE_3_VERIFICATION.md) for completed checks and limits.

## Product experience

The main journey is **Choose a picture → Open the surprise → Fold it again → Print and color**. In phase 4, an adult can also help create a new picture.

Use a colorful craft-table interface around a white paper canvas: rounded controls, cheerful accents, generous spacing, readable labels, and simple instructions. Keep the artwork itself black and white, with bold rounded outlines, cute expressive objects, cozy scenes, and large areas to color. These are the visual qualities to carry forward from the requested Coco Wyo reference.

Working assumptions are elementary-age children with adult help for printing and AI. The initial experience has no child accounts, social features, advertising, public uploads, or free-form chat. It works on phones, tablets, and desktop browsers. Coloring on screen is a possible later feature; coloring printed paper is part of phase 3.

The attached cooler image establishes the desired closed-to-surprise transformation. The [creator's accompanying lesson](https://artforkidshub.com/how-to-draw-an-exploding-summer-cooler-folding-surprise/) describes a summer cooler folding surprise. Direct access to the [YouTube video](https://www.youtube.com/watch?v=GJsBg9JN6QY) failed during planning, so its exact fold sequence has not been verified.

## Paper geometry comes first

Treat “folded in thirds” as a requirement to investigate, rather than hard-coding three equal image strips. A three-section accordion and a surprise fold can have different visible regions. A picture that looks right after a screen animation still needs to work on a real sheet.

At checkpoint 1A, compare an equal-thirds accordion with a surprise-fold prototype. Use numbered bands and seam markers on blank paper, record the crease locations and fold directions, and identify precisely which areas remain visible when closed. Select the geometry that reproduces the reference's compact picture and hidden interior. If literal equal thirds is retained, its surface mapping must pass the same physical test.

Store crease positions, panel sizes, front/back orientation, visible regions, and layer order in a versioned `FoldTemplate`. Use normalized coordinates so the same geometry can scale to screen and paper. The default sheet is exactly US Letter, 8.5 × 11 inches (612 × 792 page coordinates). Preserve its width when unfolding. Do not confuse the hidden artwork region with a single physical panel: folded layers may conceal part of another panel.

**One master composition drives every output.** A closed view is a projection of that composition through the fold template. The expanded view displays the whole composition. Printing places that same composition and its matching fold guides on the page. Never author unrelated closed and open pictures and swap between them.

## Proposed architecture

Use React, TypeScript, and Vite for the initial client, with CSS for layout and paper transforms. Keep animation independent of React rendering where practical. Begin with DOM/SVG panels, clipping, transform origins, and plain paper backs; a WebGL engine is unnecessary for the first prototype.

| Component | Responsibility |
| --- | --- |
| `DemoGallery` | Discover and select approved static artwork |
| `PaperStage` | Render the current fold state and artwork |
| `FoldControls` | Open, close, reset, and optional drag interaction |
| `ArtworkRepository` | Load validated artwork metadata and assets |
| `FoldTemplate` | Shared surface mapping and crease geometry |
| `PrintLayout` | Compose artwork, guides, and print instructions |
| `GenerationService` | Phase 4 server boundary for protected AI jobs |

Keep phase 1–3 content in versioned repository assets. Add a backend only for phase 4. Both static and generated assets must satisfy the same artwork contract. Choose hosting during implementation; no service purchase or deployment is assumed by this plan.

## Phase 1 — Web harness

Deliver the application shell, responsive craft-table layout, gallery placeholders, paper stage, loading/error states, and the shared data contract. Establish local development, build, lint, and type-check commands. Reserve an adult settings area for later, without showing children inactive AI controls.

- [ ] **1A — Fold contract:** Numbered screen prototypes, downloadable US Letter SVGs, geometry tests, and [fold documentation](FOLD_CONTRACT.md) are complete. The surprise fold is the provisional default; physical verification remains pending until someone actually folds the sheets.
- [x] **1B — Working shell:** Lockfile installation, local startup, and production build verified. Gallery selection displays the correct concept placeholder in the stage. Loading and failed-request recovery work without an API key.
- [x] **1C — Usable interface:** Chromium checks passed at 360, 768, and 1280 CSS pixels, including 44-pixel primary targets, visible keyboard focus, dialog focus restoration, reduced motion, exact US Letter proportions, and zero reported axe violations in the tested views. See evidence for browser/device limits.

Exit condition: the application runs without an API key, the shell is usable, and the fold contract is ready to guide artwork production. Shell work may proceed while physical verification is pending; do not finalize geometry-dependent artwork until it passes.

## Phase 2 — Virtual paper and static demo artwork

Implemented October 4, 2026 at the user’s request using the provisional surprise v1 geometry. The three assets are approved for the software demo after agent visual review; human sign-off and physical registration remain pending. This advances the screen experience without closing checkpoint 1A or claiming print readiness.

Implement closed, opening, open, and closing states. Start with an explicit **Open the surprise** / **Fold it back** button. Add a drag handle after button interaction works, with clamped progress, snap-to-end behavior, and pointer cancellation. Keyboard and reduced-motion users must be able to reach the same states without dragging.

The paper should change shape as it unfolds. Keep illustrations attached to their paper surfaces, hide back-facing artwork, and add subtle creases and shadows outside the printable master. The surprise remains concealed until the fold opens. Selecting another picture resets to closed. Repeated input must not corrupt state.

Manually author three original demo compositions using [the artwork guide](ARTWORK_GUIDE.md):

| Demo | Closed picture | Interior reveal |
| --- | --- | --- |
| Picnic cooler | A smiling closed cooler | Fruit, popsicles, and playful picnic objects |
| Cozy gift box | A little box with a bow | Friendly animals, stars, and a celebration |
| Tiny flower pot | A pot and small sprout | A tall garden with smiling bugs and flowers |

Create and validate the cooler first, then reuse the template for the other two. Prefer manually constructed SVG masters for precise seams and crisp printing. Optional creator-side ImageGen drafts may help develop motifs, but the demo ships as reviewed static files and never calls an image API at runtime.

- [ ] **2A — One complete reveal:** The cooler works in closed, intermediate, and open screen views, with rigid paper surfaces and aligned digital seams. Comparison with a physically folded prototype remains pending.
- [x] **2B — Repeatable asset workflow:** All three artworks have an editable SVG master, generated closed thumbnail, manifest metadata, state-specific descriptions, and recorded agent visual review. A browser test adds another manifest entry without renderer changes. Human review is explicitly pending in each record.
- [ ] **2C — Interaction verification:** Chromium and WebKit checks cover mouse, simulated touch (Chromium), keyboard, pointer cancellation/lost capture, Escape, blur, resize, rapid reversals, and reduced motion. Firefox fails before page load with a profile-folder launch error. Installed Safari and real touch-device checks remain pending.
- [x] **2D — Demo release:** All three demos run locally without credentials or generation services. Browser tests confirm manifest, master, and thumbnail error recovery and no third-party requests in the core journey. No deployment was requested.

Exit condition: a child can choose and repeatedly unfold three demo pictures, with a convincing paper reveal and an accessible button alternative. Screen-reader descriptions reflect the current state without unnecessarily revealing the surprise while closed.

## Phase 3 — Print, color, and fold

Implemented October 4, 2026 at the user’s request using provisional surprise v1 geometry. The print preview, browser Print / Save as PDF flow, and vector export checks are complete. Physical folding and family usability are still pending; the interface and instruction sheets identify these as trial prints. This does not close checkpoint 1A or claim a physically verified craft.

Add an adult-friendly print preview with US Letter and A4 options. Print the fully expanded master, never a screenshot of transformed paper. Offer subtle fold guides, a clean-art option, and a separate optional instruction sheet. Use the tested template to generate numbered fold directions.

Center and scale artwork uniformly inside conservative printer margins. Derive fold-guide positions after scaling and placement, using the same transform as the art. Changing paper size must preserve the seam relationships. Include a small optional calibration ruler and clear instructions for actual-size printing and browser headers/footers.

Provide browser printing and Save as PDF first. Treat a dedicated one-click PDF download as a separate enhancement if browser output proves insufficient. Preserve vectors where possible; check effective resolution at final print size for raster assets rather than assuming a larger pixel count adds detail.

- [x] **3A — Print preview parity:** Preview, print layout, and digital reveal use the same master and fold-template revision. Chromium and WebKit checks confirm shared markup, paper options, clean art, instructions, keyboard access, and print styles.
- [x] **3B — Export checks:** All three demos were exported as Letter and A4 PDFs through Chromium and visually reviewed at full-page size. The eight PDF checks include clean art and direct browser printing: correct page counts, conservative margins, vector paths without raster images, an accurate 50 mm ruler, and no studio controls or shadows. Native print dialogs and other engines’ PDF exports remain unverified; see [evidence](PHASE_3_VERIFICATION.md).
- [ ] **3C — Physical fold test:** Print and fold every demo at both supported sizes. The compact picture joins within a target 2 mm tolerance and opening reveals the intended scene. Adjust the template or instructions if needed.
- [ ] **3D — Family usability:** An adult and child can follow the printed directions, color the picture, and repeat the surprise. Record feedback and correct confusing steps.

Exit condition: all three demos work as physical coloring crafts. Automated layout checks and PDF screenshots cannot close the physical fold checkpoint by themselves.

## Phase 4 — Optional AI assistance

Start with adult-assisted, template-constrained generation: choose a cooler, box, or pot and describe the surprise inside. Children continue to have a complete static experience. Arbitrary new folding shapes come later.

The first AI implementation generates an interior illustration inside a reserved region of an approved template. Code preserves the outer silhouette, seam anchors, and crease geometry, then combines everything into a new master. This reduces reliance on a model placing seam-critical elements exactly; OpenAI documents limits in precise composition control. [Image generation documentation](https://developers.openai.com/api/docs/guides/image-generation)

The proposed request flow is:

1. An authenticated adult selects a template and supplies a short idea or preset.
2. The server validates length and structure and checks locally for identifying information before any provider call, then moderates accepted text. Reject suspected personal data; treat automated detection as a fallible safeguard, not a guarantee.
3. An instruction layer converts the accepted idea into a bounded art brief. User text is content, never authority to replace the artwork rules.
4. A background job generates the interior art using a currently supported OpenAI image model with standard filtering enabled.
5. The server moderates the result and validates dimensions, crop, line-art quality, and template fit. Failed or unavailable checks leave the output quarantined.
6. The compositor overlays approved art within the template and produces the master used for preview and printing.
7. An adult reviews the final closed, expanded, and printable composition before it becomes available in the child's gallery.

Prompt instructions alone do not establish age appropriateness. Combine bounded themes, input and output checks, visual review, and reporting/removal. OpenAI moderation accepts text and images, but some categories support text only; image moderation is not comprehensive child-safety certification. [Moderation documentation](https://developers.openai.com/api/docs/guides/moderation)

Keep `OPENAI_API_KEY` on the server, outside client bundles, browser storage, and logs. The first version uses the operator's key through a protected backend; hosted parent-provided keys require a separate design for encrypted storage, revocation, and access. A local parent-run installation can use its own server environment variable.

Use authenticated generation endpoints, per-account limits, a daily spend cap, one in-flight job per session, job ownership checks, and bounded retries for transient failures. Handle blocked prompts, invalid credentials, exhausted quota, timeouts, cancellation, and duplicate requests explicitly. Cache approved results and keep generation optional through a feature flag. Do not promise instantaneous generation or hard-code model pricing in the UI.

The proposed first release accepts no child photos, names, school details, or other identifying information. Before enabling AI for minors, verify current provider requirements and the intended audience/data flow. OpenAI's current under-18 guidance says not to process personal data from children under 13 or the applicable age of digital consent without first implementing zero data retention. An adult settings screen alone does not establish compliance. [Under-18 guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)

- [ ] **4A — Protected integration:** The key is server-only; adult access is enforced by the backend; limits, spend controls, and a disabled-AI fallback work.
- [ ] **4B — Safe request handling:** Benign ideas succeed; inappropriate requests, identifying information, and instruction-bypass attempts do not reach the child's gallery. Run a documented evaluation set and verify fail-closed behavior when checks fail.
- [ ] **4C — Artwork compatibility:** A representative batch of at least ten generated interiors passes adult review, folded/expanded comparisons, and Letter/A4 layout checks; physically fold representative outputs for each template.
- [ ] **4D — Operational readiness:** Verify latency states, timeout handling, cancellation semantics, duplicate protection, deletion, and quota errors. Record model, prompt, and template versions, plus measured generation cost and review rejection rate.

Exit condition: an adult can create, review, save, reopen, and print a suitable new surprise using the same paper system, and the application remains useful when AI is unavailable.

## Artwork contract and custom instructions

Each artwork record should include `id`, `title`, `templateId`, `templateVersion`, master asset path, intrinsic dimensions or SVG viewBox, thumbnail, folded/expanded descriptions, print bounds, and review status. Keep provenance and generation details in creator metadata. Only approved records appear in the child-facing gallery.

The [artwork guide](ARTWORK_GUIDE.md) is the initial reusable custom instruction set. Prove it with one complete asset before packaging it into a dedicated local skill. A future skill can orchestrate reading a brief, creating drafts, composing art, exporting previews, and recording review, while retaining the same contract.

Use ImageGen when creating or editing bitmap drafts, the PDF skill when producing and visually verifying PDF artifacts, and official OpenAI documentation when implementing the API. These are authoring aids; the deployed demo does not depend on access to Codex skills.

## Review evidence and next implementation slice

Keep checkpoint status and evidence in this plan as work proceeds: build/check output, screenshots of closed/intermediate/open states, exported PDFs, and a dated note or photo of physical fold results. Mark unavailable physical checks as pending. Do not treat a successful screenshot or generation request as completion of a whole phase.

Phase 3’s print preview and browser exports are implemented with [review evidence](PHASE_3_VERIFICATION.md). Next, print and fold all three demos on Letter and A4, record the seam errors, and run the adult/child usability check using the evidence document’s worksheet. Obtain human artwork review and correct the template or instructions if needed. Close the Firefox, installed Safari, native print-dialog, and real touch-device verification gaps. Complete physical print validation before enabling Phase 4 live generation.
