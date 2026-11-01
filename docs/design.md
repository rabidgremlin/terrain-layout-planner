# Terrain layout planner design

This document records the agreed design from the design interview. The user confirmed the shared understanding and deployment adaptations; implementation has not started.

## Confirmed requirements

- A browser tool for arranging wargame terrain on a selectable board size.
- Premade terrain shapes dragged from a sidebar onto the board.
- Every terrain piece and terrain template supports multiple simultaneous tags, including properties such as cover, blocking, elevation, and danger. Tags are not a single-choice terrain category.
- Custom terrain shapes, tags, and colours.
- Board coverage calculations for terrain overall and by tag.
- Deployment zone selection.
- Point-to-point and maximum board-wide line of sight tools using a 2D approximation.
- Game selection supplying board sizes, terrain pieces, recommendations, and feedback when recommendations are unmet.
- Initial named game: Grimdark Future: Firefight, using the supplied advanced rulebook v3.6.0 in `refdocs/`. Also include a Custom game mode without game recommendations.
- Named layouts stored in localStorage, with no login, server components, or server storage.

## Agreed architecture

Use React and Konva for editing and rendering. Konva's [React bindings](https://konvajs.org/docs/react/index.html) expose interactive shapes and [canvas image export](https://konvajs.org/docs/react/Canvas_Export.html), which fit the agreed editor and PNG output.

Keep board dimensions, footprints, tags, and visibility rules in application data independent of Konva. Use that data for storage, undo/redo, coverage, LOS, and exports, and let Konva render it. This follows Konva's [save/load guidance](https://konvajs.org/docs/data_and_serialization/Best_Practices.html) to persist application state rather than the scene tree; it also avoids coupling game geometry to screen pixels. PDF document composition and geometric analysis require additional code beyond the rendering layer.

## Decisions from interview round 1

- This is a planner for physical tables, not a gameplay or model tracker.
- Line of sight uses a labelled top-down, two-dimensional approximation.
- Terrain uses basic footprint shapes rather than detailed buildings. The accepted recommendation includes rectangles, circles, editable polygons, dimensions, colours, and multiple tags.
- Total terrain coverage uses the geometric union of footprints clipped to the board. Per-tag coverage applies the same calculation to matching pieces. Tag totals may exceed total terrain coverage.
- Game recommendations are advisory; users may create layouts that do not meet them. Published guidance and application heuristics must be distinguished.
- Desktop mouse and keyboard editing comes first; full tablet editing is deferred.

## Decisions from interview round 2

- Export formats are PNG and PDF only. JSON import/export is outside scope.
- Include a point-to-point LOS ruler and a board-wide search displaying the longest unobstructed straight line. If sampling is used, label its result approximate.
- Visibility behaviours are clear, blocking, and dense. Game tags supply defaults; colour has no effect on visibility.
- Clarified in round 3: terrain templates remain in scope; premade layout templates are outside scope. Physical inventory tracking has not been requested.
- Users must be able to save layouts, select from a list, name and rename, delete, and duplicate layouts.

## Decisions from interview round 3

- Initial board options include 4 × 4 feet (48 × 48 inches) and 3 × 3 feet (36 × 36 inches). Custom board sizes are also supported, following acceptance of question 12 with those explicit presets.
- Start with all six standard deployments on page 19: Frontline, Ground War, Side Battle, Disordered, Spearhead, and Opposing Forces. The 3-foot board adaptation halves deployment depths; Frontline therefore has opposing 6-inch zones, leaving a 24-inch gap. Approved outlines for all six are shown in [the adaptation diagram](deployment-adaptations.svg).
- Dimensions can be entered in inches or centimetres; changing display units preserves physical size. Support numeric rotation and an optional snapping grid.
- Terrain overlaps are permitted, including composite arrangements such as ruins over rubble. Deployment zones contribute no terrain coverage.
- Terrain templates, including the original premade sidebar pieces, remain in scope. The earlier rejection concerned **templated layouts**, not terrain templates.
- Autosave layouts, provide undo/redo during editing, and confirm layout deletion. Duplicated layouts are independent copies.
- PNG export shows the terrain board and deployment zones. PDF adds the layout name, board dimensions, terrain key, coverage, and recommendation feedback. LOS overlays are exported only when explicitly enabled.

## Decisions from interview round 4

- Placed pieces are independent of their source template; changes to a template do not alter saved layouts. A piece can explicitly be saved as a new template. Custom templates support naming, editing, duplication, and deletion.
- Tags are user-defined. Each piece has an explicit visibility behaviour: clear, blocking, or dense. Premade pieces supply defaults, which users may override. Blocking wins in overlapping footprints.
- The user requested official-source web research into other games' LOS and terrain models before finalising future extensibility. Initial visibility behaviour is accepted as a starting point, not an assertion that it represents every game faithfully.
- When board dimensions change, keep terrain pieces at their existing board coordinates and physical sizes; the user can reposition them. This supersedes the earlier proposal to preserve positions relative to the board centre. Off-board portions are excluded from coverage and exports, and affected pieces are flagged.
- Include a Custom game mode without game recommendations.

## Decisions from interview round 5

- On smaller boards keep published terrain-count targets as advisory, rather than inventing scaled targets. Identify smaller-board deployments as application adaptations.
- Source research comparing Infinity, Alpha Strike, and Warhammer 40,000 is captured in [Terrain and line of sight across games](research/terrain-and-line-of-sight.md). It supports separating geometry, tags, and game-specific visibility policy. Depth thresholds, height, and observer/state-dependent effects are future capabilities, not additions to the initial Firefight scope.

## Approved 3-foot deployment outlines

[Adaptation diagram](deployment-adaptations.svg). These are user-approved application adaptations, not published deployment diagrams. Preserve full-width edges for Frontline and Spearhead; halve their depth from 12 to 6 inches. For corner-based zones, halve local zone dimensions and anchor to the corresponding corner of the 36-inch board. This yields 12-inch outer legs and 6-inch steps for Ground War, 21-by-12-inch right triangles for Side Battle, 12-inch triangle legs for Disordered, and 12-by-6-inch rectangles for Opposing Forces.

The original diagrams were inspected in the supplied PDF; positions are inferred from their grid rather than written coordinates. Do not impose a universal 24-inch separation check on all six advanced styles: some original 48-inch diagrams themselves permit closer deployments.

## Firefight source findings

Source: [supplied advanced rulebook v3.6.0](../refdocs/GFF_-_Advanced_Rulebook_v3_6_0_-_Print_Friendly.pdf). These findings describe the supplied edition, not a claim about the latest rules.

- Page 6: standard board is 48 × 48 inches; smaller playing areas are permitted if armies deploy at least 24 inches apart. Core deployment uses opposing 12-inch-deep zones.
- Pages 6 and 11: page 6 specifies at least 20 terrain pieces and recommends 25 or more; page 11 advises at least 20–25 pieces.
- Page 11: the 50% terrain quantity heuristic describes gathering enough terrain to cover half the table before spreading it out. The application's final-layout union coverage is a useful metric, but is not an exact transcription of that procedure.
- Page 11: terrain mix recommendations use **piece count**, not covered area: at least 50% sight blocking, 33% cover, and 33% difficult; each player chooses one dangerous piece. Multiple properties can apply to one piece.
- Pages 11–12: suggested defaults include buildings as impassable and sight blocking, fields as difficult and cover, forests as difficult and cover and dense, hills as cover and steep, and ruins as cover and unstable. These are guidelines; players agree on terrain properties.
- Page 12: dense terrain permits sight into and out of it, but not through it to targets beyond. This differs from sight-blocking terrain.
- Page 5: actual game LOS is from miniature eye level. The chosen 2D planner therefore provides an approximation.
- Page 19 diagrams have been visually inspected: the six standard styles are Frontline, Ground War, Side Battle, Disordered, Spearhead, and Opposing Forces. They depict 48-inch boards. No explicit 36-inch adaptation is supplied; this application uses the approved adaptations above. Strategic and asymmetric styles are on pages 20–21.
- Page 27: optional terrain placement modes add separation requirements; those must not be applied to every layout.

Game recommendation checks must distinguish terrain piece counts from geometric coverage. Use the core, non-tournament guidance above for the initial preset; optional placement modes are not global constraints.

## Final confirmation

- The user approved the 3-foot deployment outlines and React/Konva architecture and confirmed the shared understanding.
- A terrain piece may carry multiple tags simultaneously. For example, a forest tagged Cover, Difficult, and Dense contributes to all three per-tag coverage figures and all three applicable tag piece counts, but contributes only once to total terrain coverage and total terrain piece count.
- Multiple tags remain distinct from the single explicit visibility behaviour. Premade pieces provide coherent defaults, and users may override them.

Implementation details such as numerical tolerances and maximum-LOS sampling resolution should be documented during implementation. They must preserve the agreed footprint semantics and avoid presenting sampled results as exact.
