# Terrain layout planner ticket breakdown

Published approved breakdown. Source: [spec #2](https://github.com/rabidgremlin/terrain-layout-planner/issues/2), including the confirmed browser and public-analysis testing boundaries. T1–T14 below are plan identifiers, mapped to GitHub issues in the table below.

Each ticket is a demoable vertical slice, including user-facing behaviour, application data, local persistence where applicable, and tests. Start from the existing React/TypeScript/Vite starter; no separate prefactoring slice is needed. The initial slice introduces only the state and storage needed for a working board, then later slices extend that same domain model without discarding saved layouts. Keep numerical geometry and game rules independent of Konva throughout.

All 14 tickets are published with the ready-for-agent label, linked as sub-issues of #2, and connected by 19 native blocking relationships. Verified all issue bodies against the approved criteria (91 total), all labels and relationships, and preservation of the parent spec's title, body, status, and labels.

## Accepted tag-model change (2026-11-02)

[ADR 0002](../adr/0002-derive-los-blocking-from-layout-tags.md) and the updated local
spec supersede the visibility requirements below. The published ticket bodies
are historical here and have not been changed on GitHub by this discussion.
Closed issue #5 remains the record of the original delivered catalog work;
layout-owned tag rules and Layout settings need new follow-up implementation work.

The follow-up must deliver shared editable tag definitions, membership-derived
blocking, the Layout settings Tags tab, wall variants, tag lifecycle and one-step
Save/undo, persistent layout isolation, and the agreed old-data reset. T4/T6 must
consume the new tag model; T7/T10 must derive blocking coverage/counts from it;
T11/T12 must use ordinary solid blocking, including Dense and endpoints inside
blockers. Their implementation tickets must be brought into line before work
starts. Source-rule quotations remain distinct from the planner's approximation.

## Published tickets

| Plan | GitHub issue | Blocked by |
| --- | --- | --- |
| T1 | [#3 — Create a board, place terrain, and resume after reload](https://github.com/rabidgremlin/terrain-layout-planner/issues/3) | None |
| T2 | [#4 — Edit terrain precisely with units, snapping, and undo](https://github.com/rabidgremlin/terrain-layout-planner/issues/4) | #3 |
| T3 | [#5 — Place a terrain catalog and edit multiple tags and visibility](https://github.com/rabidgremlin/terrain-layout-planner/issues/5) | #3 |
| T4 | [#6 — Draw and edit irregular terrain footprints](https://github.com/rabidgremlin/terrain-layout-planner/issues/6) | #4 |
| T5 | [#7 — Manage a collection of named saved layouts](https://github.com/rabidgremlin/terrain-layout-planner/issues/7) | #3 |
| T6 | [#8 — Save and manage reusable custom terrain templates](https://github.com/rabidgremlin/terrain-layout-planner/issues/8) | #5, #6 |
| T7 | [#9 — Show terrain coverage and piece counts by tag](https://github.com/rabidgremlin/terrain-layout-planner/issues/9) | #5, #6 |
| T8 | [#10 — Resize boards without moving terrain](https://github.com/rabidgremlin/terrain-layout-planner/issues/10) | #4 |
| T9 | [#11 — Select standard Firefight deployments on both board presets](https://github.com/rabidgremlin/terrain-layout-planner/issues/11) | #3 |
| T10 | [#12 — Give advisory Firefight terrain recommendations](https://github.com/rabidgremlin/terrain-layout-planner/issues/12) | #9 |
| T11 | [#13 — Measure point-to-point two-dimensional line of sight](https://github.com/rabidgremlin/terrain-layout-planner/issues/13) | #5, #6 |
| T12 | [#14 — Find the maximum line of sight across the board](https://github.com/rabidgremlin/terrain-layout-planner/issues/14) | #13 |
| T13 | [#15 — Export the board as PNG with optional LOS overlays](https://github.com/rabidgremlin/terrain-layout-planner/issues/15) | #11, #14 |
| T14 | [#16 — Export a PDF setup reference with terrain analysis](https://github.com/rabidgremlin/terrain-layout-planner/issues/16) | #7, #12, #15 |

The initial frontier is #3. Work the frontier as blockers close; these relationships do not impose a single linear implementation order.

## T1 — Create a board, place terrain, and resume after reload

**Blocked by:** None (can start immediately).

**What to build:** Replace the starter screen with a working desktop planner: choose Firefight or Custom game, choose a board, drag a premade rectangular terrain piece onto it, move it, and reload to resume the same arrangement.

**Acceptance criteria:**

- Offer 48 × 48 inch, 36 × 36 inch, and custom positive board dimensions when creating a plan. The active game and physical dimensions are visible.
- Render the board with React and Konva and provide a minimal premade sidebar entry that can be dragged onto the board repeatedly.
- Select and move placed pieces using mouse interaction; allow overlap and preserve independent placed-piece data rather than references to mutable template contents.
- Keep physical board state independent of canvas pixels and Konva serialization. Establish an extensible representation for footprint, transform, multiple tag memberships, and explicit visibility behaviour without requiring the full properties UI yet.
- Autosave the current plan in localStorage, with no account, backend, or remote storage; reload restores its game, board, and terrain positions.
- Add a browser acceptance test for creation, drag placement, movement, and reload using actual browser storage. Complete build/type-check and lint checks.

## T2 — Edit terrain precisely with units, snapping, and undo

**Blocked by:** T1.

**What to build:** Let players size, orient, duplicate, remove, and arrange their terrain accurately, with reversible edits and a choice of measurement units.

**Acceptance criteria:**

- Support exact physical terrain width and depth and visual and numeric rotation, keeping rendering and stored geometry consistent.
- Switch between inches and centimetres without changing physical dimensions or positions.
- Provide optional grid snapping for placement and movement, and preserve unsnapped positioning when disabled.
- Duplicate and remove selected terrain pieces; duplicates are independent.
- Provide undo/redo for terrain edits, including movement, sizing, rotation, duplication, and removal; autosave the resulting state.
- Later features must extend the same editing history for their own terrain changes rather than introducing competing undo mechanisms.
- Browser tests verify unit preservation, precise transforms, snapping, independent duplication, undo/redo, and reload persistence.

## T3 — Place a terrain catalog and edit multiple tags and visibility

**Blocked by:** T1.

**What to build:** Populate the sidebar with common Firefight terrain, including rectangular and circular footprints, and let players customise a piece's colour, multiple tags, and visibility behaviour.

**Acceptance criteria:**

- Provide usable premade terrain choices with physical dimensions and the supplied Firefight edition's suggested tags, including buildings, barricades, fields, forests, hills, water, lava, rubble, ruins, swamps, mountains, and walls; reasonable size variants may share a type.
- Include circular as well as rectangular terrain footprints and preserve their shape on placement and reload.
- Allow multiple simultaneous tags on every piece and template; a forest can retain Cover, Difficult, and Dense together.
- Allow creation of custom tags and adding/removing memberships on a placed piece. Colour is editable and does not determine visibility.
- Provide an explicit clear/blocking/dense setting with coherent catalog defaults and per-piece overrides. Merely naming a custom tag does not invent a new LOS rule.
- Persist placed-piece properties locally; modifying a piece does not change its catalog definition or another piece.
- Browser tests cover multi-tag editing, custom tags, colour, independent overrides, circular placement, and reload persistence. Integrate properties with undo/redo when that capability is present.

## T4 — Draw and edit irregular terrain footprints

**Blocked by:** T2.

**What to build:** Let players create irregular terrain footprints by drawing and editing polygons on the board, with the same positioning, dimensions, and history behaviour as basic shapes.

**Acceptance criteria:**

- Create a closed polygon from user-selected vertices and edit its vertices after creation.
- Provide clear feedback for invalid or incomplete footprints rather than saving geometry the analysis cannot interpret.
- Support selection, movement, exact physical sizing, rotation, duplication, and removal of polygon pieces using the existing editor.
- Preserve polygon geometry and transforms across autosave and reload, with undo/redo for footprint creation and edits.
- Use the same piece data contract so the properties UI can apply multiple tags, colour, and explicit visibility behaviour once available.
- Browser tests create and revise an irregular polygon, transform it, undo/redo, and reload to verify the resulting footprint.

## T5 — Manage a collection of named saved layouts

**Blocked by:** T1.

**What to build:** Let players maintain multiple named layouts, select and reopen them, rename them, make independent copies, and delete them with confirmation.

**Acceptance criteria:**

- Create named layouts and show a saved list from which an existing layout can be selected and reopened.
- Autosave each layout's game, board, placed terrain, properties, and later-added deployment selection without losing changes when switching layouts or reloading.
- Rename layouts and duplicate an entire layout as an independent copy; changing a duplicate does not affect its source.
- Confirm deletion of a saved layout; cancelling preserves it, and confirming removes the intended layout without deleting other plans.
- Preserve any existing single-plan data created by the foundation slice when introducing the collection.
- Keep layouts in localStorage without login or remote storage. Do not add premade whole-layout templates or JSON import/export.
- Browser tests cover creation, list selection, rename, switching, reload, independent duplication, and both deletion outcomes using isolated real storage.

## T6 — Save and manage reusable custom terrain templates

**Blocked by:** T3, T4.

**What to build:** Let players save a configured terrain piece as a custom template and maintain a locally persisted library reusable across layouts.

**Acceptance criteria:**

- Explicitly save a placed rectangle, circle, or polygon as a named custom terrain template, including dimensions, colour, multiple tags, and visibility behaviour.
- Show custom templates in the sidebar and support repeated drag placement alongside the premade catalog.
- Name, edit, duplicate, and delete custom templates; persist library changes across reloads.
- Every placed piece is an independent copy. Editing or deleting a template must leave already placed pieces and saved layouts unchanged.
- Do not mutate the built-in catalog as a side effect of editing a placed piece or saving a custom template.
- Browser tests cover saving, reusing, editing, duplicating, and deleting custom templates, including source/instance independence and reload persistence.

## T7 — Show terrain coverage and piece counts by tag

**Blocked by:** T3, T4.

**What to build:** Show total terrain coverage and per-tag coverage and piece counts while players edit terrain, with correct overlap and board-edge handling for all footprint types.

**Acceptance criteria:**

- Display total occupied board area as the geometric union of transformed terrain footprints clipped to the playing area, divided by board area.
- Calculate each tag's coverage by unioning matching pieces only. One area may contribute to several tags; their percentages need not sum to total coverage.
- Display total piece count and per-tag counts separately from coverage. Count one multi-tag piece once overall and once in each matching tag set; overlapping distinct pieces remain distinct counts.
- Support rectangles, circles, irregular polygons, rotation, nested footprints, and partial off-board pieces. Deployment overlays are not terrain.
- Expose results through the public planner-analysis interface consumed by the visible metrics; avoid analysing Konva's scene graph.
- Analysis tests use independently known results: two 4-square-inch pieces overlapping by 2 square inches on a 100-square-inch board yield 6% total coverage; different tags each yield 4% tag coverage. Include multi-tag, transformed, circular, polygon, and clipping cases.
- Browser tests verify that editing pieces and tags updates the displayed metrics and that reloaded layouts produce the same results.

## T8 — Resize boards without moving terrain

**Blocked by:** T2.

**What to build:** Let players change the board size of an existing layout while keeping every terrain piece at its existing physical coordinates and dimensions.

**Acceptance criteria:**

- Switch an existing layout between board presets or enter custom dimensions in the selected display units.
- Preserve terrain coordinates, dimensions, and rotation; do not scale, recenter, or automatically reposition pieces.
- Flag pieces partly or fully outside the resized board and keep them selectable and movable so the player can bring them back.
- Persist the new board and unchanged piece geometry. Integrate resizing with editing history.
- Render the correct playable boundary and ensure later deployment/analysis/export consumers receive the updated physical dimensions rather than stale canvas dimensions.
- Browser tests shrink and enlarge an existing board, verify unchanged terrain geometry, reposition an off-board piece, undo/redo, and reload.

## T9 — Select standard Firefight deployments on both board presets

**Blocked by:** T1.

**What to build:** Let Firefight players select any of the six standard deployment styles and view the appropriate zones on 4′ and 3′ boards.

**Acceptance criteria:**

- Offer Frontline, Ground War, Side Battle, Disordered, Spearhead, and Opposing Forces from the supplied v3.6.0 standard-deployment diagrams.
- Match the original 48-inch diagrams and opposing-zone arrangement; keep zones separate from terrain data.
- Use the approved 36-inch adaptations: full-width Frontline zones 6 inches deep; full-width Spearhead bases with 6-inch apex depth; Ground War corner Ls with 12-inch outer legs and 6-inch steps; Side Battle corner triangles 21 by 12 inches; Disordered corner triangles with 12-inch legs; Opposing Forces corner rectangles 12 by 6 inches.
- Clearly identify smaller-board zones as application adaptations, not published diagrams. Do not invent a universal 24-inch separation constraint for all standard styles.
- Persist the chosen deployment with the current layout and restore it after reload; use current board dimensions when selecting the preset.
- Do not silently show an incorrectly sized official diagram on an unsupported custom board. Surface any limitation rather than claiming an unapproved official adaptation.
- Browser tests verify selection and reload for all six styles on both supported square sizes; analysis-level fixtures or observable measurements verify their physical geometry. Zones must not contribute to terrain coverage when analysis is available.

## T10 — Give advisory Firefight terrain recommendations

**Blocked by:** T7.

**What to build:** Give Firefight players source-labelled guidance on terrain quantity, terrain mix, and coverage, without preventing unusual layouts or house rules.

**Acceptance criteria:**

- Distinguish page 6's minimum of 20 pieces and recommendation of 25 or more from page 11's advice to use at least 20–25 pieces.
- Evaluate the source's piece-count mix guidance: at least 50% sight blocking, 33% Cover, and 33% Difficult, plus two Dangerous pieces for the initial opposing-player setup. Tags may overlap, and area percentages must not be substituted for count percentages.
- Retain the same published advisory count targets on 36-inch boards rather than inventing smaller targets.
- Show final-layout union coverage while explaining that the source's 50% heuristic concerns gathering terrain before spreading it out; do not claim those procedures are identical.
- Identify met, unmet, and manually reviewed/unevaluated guidance. Explain source placement advice without declaring undefined spacing or sight-line heuristics automatically passed.
- Custom game mode has no Firefight recommendations. Unmet guidance never blocks editing, saving, or export, and optional placement/tournament rules are not applied globally.
- Analysis tests distinguish counts from area and exercise thresholds, multiple tags, empty layouts, and smaller boards. Browser tests verify live feedback and continued editing/saving with unmet recommendations.

## T11 — Measure point-to-point two-dimensional line of sight

**Blocked by:** T3, T4.

**What to build:** Let players select two points on the board and see the line, physical distance, and visibility status under the chosen pieces' explicit visibility behaviours.

**Acceptance criteria:**

- Provide a board interaction for selecting two points and displaying a sight line with distance in the selected units.
- Clear terrain does not interrupt LOS; blocking terrain does. Dense terrain permits sight into and out of its footprint but prevents sight through it to a target beyond.
- Blocking takes precedence where it overlaps clear or dense terrain. Colour and arbitrary tag names do not silently change visibility policy.
- Analyse transformed rectangles, circles, and polygons within the playable board through the public planner-analysis interface, independent of Konva rendering.
- State and consistently apply an endpoint/boundary/tangency convention. Label the tool as a top-down 2D approximation rather than true miniature-eye-level visibility.
- Analysis tests cover clear/blocking/dense lines, endpoint containment, multiple terrain intersections, transformed footprints, overlap precedence, and boundary cases. Browser tests verify endpoint selection, status, distance, and updates after terrain changes.

## T12 — Find the maximum line of sight across the board

**Blocked by:** T11.

**What to build:** Let players find and display the longest unobstructed straight line discovered anywhere on the board, using the same visibility semantics as the LOS ruler.

**Acceptance criteria:**

- Search across the entire playable board rather than only from a selected point or between deployment zones.
- Display the resulting sight line and physical length, honouring clear/blocking/dense behaviour and overlapping blockers consistently with point-to-point LOS.
- Keep the visible result tied to the current terrain and board state; invalidate or recompute stale results after edits.
- If sampling is used, label the result approximate and document the search strategy and relevant precision rather than claiming an exact global optimum.
- Keep the desktop editor usable while the search runs.
- Analysis tests use independently known open-board and blocker fixtures, verify returned candidates are valid under the shared LOS query, and use appropriate bounds for approximate results. Browser tests cover triggering, displaying, and refreshing the result after an edit.

## T13 — Export the board as PNG with optional LOS overlays

**Blocked by:** T9, T12.

**What to build:** Let players download a PNG setup reference containing the board, terrain, and deployment zones, with LOS analysis included only when explicitly enabled.

**Acceptance criteria:**

- Export valid readable PNG imagery representing current board dimensions, terrain geometry, colours, and visible deployment zones.
- Clip imagery to the playable board so off-board terrain portions do not appear as playing-area content.
- Omit selection handles, editing tools, and other editor-only affordances.
- Exclude LOS overlays by default; provide explicit opt-in for the displayed ruler or maximum-line overlay.
- Generate the download client-side without login or server storage, including when game recommendations are unmet.
- Browser tests inspect a real PNG download for dimensions, clipping, terrain/deployment content, and overlay opt-in, without depending on brittle whole-editor pixel snapshots.

## T14 — Export a PDF setup reference with terrain analysis

**Blocked by:** T5, T10, T13.

**What to build:** Let players download a printable PDF containing the current named layout and the measurements and guidance needed to reproduce it on a physical table.

**Acceptance criteria:**

- Produce a valid readable PDF including the layout name, board dimensions, board imagery, terrain key, total/per-tag coverage, and recommendation feedback where applicable.
- Represent multiple terrain tags in the terrain key without turning them into a single mutually exclusive category.
- Reuse the board-only export semantics: correct footprint transforms, clipped off-board portions, deployment zones, no editing controls, and LOS overlays only on explicit opt-in.
- Identify 2D LOS limitations and adapted deployments where they are represented, and preserve the distinction between source guidance and measured application metrics.
- Export Custom game layouts without Firefight guidance, and allow Firefight PDFs with unmet recommendations.
- Generate the document entirely client-side; do not introduce editable JSON backups or server rendering.
- Browser tests download and open/parse a real PDF, checking required content and the selected layout's current data rather than exact metadata bytes. Finish with the feature's browser/analysis tests and repository build/type-check and lint checks.

## Coverage and dependency review

- Foundations and physical editing: T1, T2, T4, T8.
- Terrain defaults, multiple tags, and independent reusable templates: T3, T6.
- Named layouts and local persistence: T1, T5, with each later slice persisting the state it adds.
- Coverage/count metrics and recommendations: T7, T10.
- Standard deployment zones and smaller-board adaptations: T9.
- Point-to-point LOS and maximum LOS: T11, T12.
- PNG/PDF setup references: T13, T14.
- Browser tests are included in every slice. Numerical analysis tests enter with T7/T11 and extend with the relevant follow-on behaviours; no separate testing-only or schema-only ticket is required.
- T1 can start immediately. Once it lands, T2, T3, T5, and T9 can start independently. T4 and T8 follow T2; T6, T7, and T11 follow T3 plus T4; T10 follows T7; T12 follows T11; T13 follows T9 plus T12; T14 follows T5 plus T10 plus T13.
- Dependencies are direct feature prerequisites, not a forced linear implementation order. Later slices integrate with any existing persistence, history, deployment, or export capabilities while preserving already delivered behaviour.
