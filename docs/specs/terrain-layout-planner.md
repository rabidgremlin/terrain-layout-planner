## Problem Statement

Wargame players need to arrange terrain they can reproduce on a physical table. They need accurate footprint dimensions, a clear view of deployment zones, and a way to assess terrain coverage, terrain mix, and long sight lines before setting up the table. Drawing shapes alone does not distinguish overlapping coverage from piece counts or explain whether a layout follows a game's terrain recommendations.

The first supported named game is Grimdark Future: Firefight, using the supplied Advanced Rulebook v3.6.0. Players also need unrestricted planning for custom games. Their layouts and custom terrain must remain available in their browser without accounts or server storage.

## Solution

Build a desktop browser terrain layout planner using React and Konva. Players choose a game and board size, select deployment zones, drag premade terrain from a sidebar, and create custom terrain footprints. Pieces support multiple simultaneous tags and an explicit two-dimensional visibility behaviour.

Show total terrain coverage, coverage and piece counts by tag, advisory Firefight guidance, a point-to-point LOS ruler, and the longest unobstructed straight line found across the board. Save named layouts and custom terrain templates locally, support undo/redo, and export PNG and PDF setup references. Make the limitations of two-dimensional LOS and application-adapted deployments clear.

## User Stories

1. As a wargame player, I want to choose Firefight, so that board options, terrain defaults, deployment zones, and guidance fit my game.
2. As a wargame player, I want a Custom game mode without game recommendations, so that I can plan other games or house rules.
3. As a Firefight player, I want a 4′ × 4′ board option, so that I can plan the standard playing area.
4. As a Firefight player, I want a 3′ × 3′ board option, so that I can plan a smaller table.
5. As a wargame player, I want to enter custom board dimensions, so that the layout matches my available playing surface.
6. As a wargame player, I want to enter dimensions in inches or centimetres, so that I can work with my preferred measurements.
7. As a wargame player, I want switching display units to preserve physical size, so that a unit change never resizes my terrain or board.
8. As a wargame player, I want an optional snapping grid, so that I can position terrain accurately.
9. As a wargame player, I want a sidebar of premade terrain templates, so that I can assemble a layout quickly.
10. As a wargame player, I want to drag a terrain template onto the board, so that I can place a terrain piece where I intend.
11. As a wargame player, I want to place multiple pieces from the same terrain template, so that I can represent repeated terrain features.
12. As a wargame player, I want to select and move a terrain piece, so that I can refine the arrangement.
13. As a wargame player, I want to enter exact terrain width and depth, so that the plan matches physical terrain.
14. As a wargame player, I want to rotate terrain visually and by a numeric angle, so that I can reproduce its orientation.
15. As a wargame player, I want to duplicate a terrain piece within a layout, so that I can add another matching feature quickly.
16. As a wargame player, I want to remove a terrain piece, so that I can revise my layout.
17. As a wargame player, I want rectangular footprints, so that I can represent buildings, walls, and other regular features.
18. As a wargame player, I want circular footprints, so that I can represent round terrain features.
19. As a wargame player, I want to create and edit polygon footprints, so that I can represent irregular terrain.
20. As a wargame player, I want to choose terrain colours, so that I can recognise different features on the board.
21. As a wargame player, I want to create my own terrain tags, so that I can describe properties relevant to my game.
22. As a wargame player, I want multiple tags on one terrain piece or template, so that a forest can be Cover, Difficult, and Dense at the same time.
23. As a wargame player, I want to add and remove tags on a placed piece, so that its properties match what players have agreed.
24. As a wargame player, I want a separate clear, blocking, or dense visibility setting, so that descriptive tags and colour do not implicitly determine LOS.
25. As a wargame player, I want premade pieces to supply appropriate tags and visibility defaults, so that I do not have to configure every piece from scratch.
26. As a wargame player, I want to override a placed piece's default properties, so that the plan supports house rules and unusual terrain.
27. As a wargame player, I want to save a piece as a custom terrain template, so that I can reuse its footprint and properties in other layouts.
28. As a wargame player, I want to name, edit, duplicate, and delete custom terrain templates, so that I can maintain a useful terrain library.
29. As a wargame player, I want custom terrain templates to survive a browser reload, so that my terrain collection remains available.
30. As a wargame player, I want placed pieces to be independent of their source templates, so that changing or deleting a template never changes saved layouts.
31. As a wargame player, I want overlapping terrain footprints, so that I can represent arrangements such as a ruin on rubble.
32. As a wargame player, I want board resizing to preserve terrain dimensions and existing coordinates, so that the tool does not silently rescale or rearrange my terrain.
33. As a wargame player, I want pieces extending outside the board to be flagged and remain editable, so that I can move them back into the playing area.
34. As a wargame player, I want total terrain coverage calculated without double-counting overlaps, so that the percentage reflects the occupied board area.
35. As a wargame player, I want coverage for each terrain tag, so that I can assess the area occupied by cover, blockers, difficult terrain, and other properties.
36. As a wargame player, I want off-board footprint portions excluded from coverage, so that statistics describe only the playing area.
37. As a wargame player, I want total piece counts and counts by tag displayed separately from coverage, so that I can understand both terrain quantity and terrain mix.
38. As a wargame player, I want a piece with several tags to contribute to every applicable tag statistic but only once to total terrain statistics, so that combined terrain properties are represented correctly.
39. As a Firefight player, I want advisory feedback on terrain quantity and mix, so that I can compare my layout with the supplied rulebook's recommendations.
40. As a Firefight player, I want the difference between published guidance and application heuristics identified, so that I understand what each recommendation means.
41. As a Firefight player, I want published terrain-count targets retained for the 3′ board as advisory guidance, so that the tool does not invent reduced targets.
42. As a wargame player, I want to edit, save, and export layouts with unmet recommendations, so that deliberate house rules and unusual layouts remain possible.
43. As a Firefight player, I want to select Frontline, Ground War, Side Battle, Disordered, Spearhead, or Opposing Forces deployment zones, so that I can plan all six standard deployment styles.
44. As a Firefight player, I want the approved 3′ deployment adaptations, so that I can use those standard styles on a smaller board.
45. As a Firefight player, I want adapted deployments identified as application conventions, so that I do not mistake them for published diagrams.
46. As a wargame player, I want deployment zones visible without affecting terrain coverage, so that setup information does not distort terrain statistics.
47. As a wargame player, I want to select two points and see LOS status and distance, so that I can inspect a particular sight line.
48. As a wargame player, I want blocking terrain to interrupt a sight line, so that solid footprints constrain the plan's two-dimensional visibility.
49. As a Firefight player, I want dense terrain to permit sight into and out of its footprint while blocking sight through it to a target beyond, so that forests differ from solid blockers.
50. As a wargame player, I want blocking behaviour to take precedence where terrain overlaps, so that a clear or dense footprint never cancels a solid blocker.
51. As a wargame player, I want to find and display the longest unobstructed straight line anywhere on the board, so that I can identify excessively open firing lanes.
52. As a wargame player, I want sampled maximum-LOS results labelled approximate, so that I understand their precision.
53. As a wargame player, I want LOS described as a two-dimensional planning approximation, so that I do not mistake it for miniature-eye-level rules adjudication.
54. As a wargame player, I want to create and name layouts, so that I can organise multiple table plans.
55. As a wargame player, I want to select and reopen layouts from a saved list, so that I can return to previous plans.
56. As a wargame player, I want to rename layouts, so that their names remain useful as plans change.
57. As a wargame player, I want layout changes saved automatically, so that ordinary edits survive a reload without a separate save step.
58. As a wargame player, I want to duplicate a saved layout as an independent copy, so that I can explore alternatives without changing the original.
59. As a wargame player, I want confirmation before deleting a saved layout, so that I can avoid accidental deletion.
60. As a wargame player, I want to delete layouts I no longer need, so that the saved list remains manageable.
61. As a wargame player, I want undo and redo during editing, so that I can reverse mistakes and compare adjustments.
62. As a wargame player, I want layouts and custom terrain stored locally without a login, so that I can use the planner without an account or server-side storage.
63. As a wargame player, I want a PNG export of the board, terrain, and deployment zones, so that I can use a visual setup reference.
64. As a wargame player, I want PDF export with the layout name, board dimensions, terrain key, coverage, and recommendation feedback, so that I can print a complete setup reference.
65. As a wargame player, I want LOS overlays exported only when I explicitly enable them, so that I can choose a clean plan or an analysis view.
66. As a wargame player, I want exports clipped to the board, so that off-board terrain portions do not appear as part of the playable layout.
67. As a desktop user, I want terrain editing designed for a mouse and keyboard, so that precise placement and shape editing are practical.

## Implementation Decisions

- **Application architecture:** extend the existing React, TypeScript, and Vite application, replacing the generated starter screen. Use Konva through React for the interactive board. Keep physical board data and game logic independent of the rendering scene graph and screen pixels.
- **Planner state:** use width and depth for terrain footprint dimensions, reserving terrain height for vertical extent above the board; custom board setup retains Width/Height. Represent layouts, terrain templates, placed pieces, multi-tag memberships, board dimensions, selected game and deployment, and explicit visibility behaviour as application data. Use a consistent physical coordinate system and convert display units without changing physical values. Persist domain data rather than serialized Konva nodes.
- **Editing and history:** coordinate board editing, selection, movement, rotation, dimensional edits, footprint creation, per-piece properties, duplication, and removal through the planner state. Support rectangles, circles, and editable polygons, with optional grid snapping and undo/redo. Selection handles and editor controls are not terrain and must not affect analysis or exported board imagery.
- **Terrain templates and pieces:** provide a premade sidebar catalog and a locally persisted custom terrain library. Instantiating a template produces an independent piece with its own footprint and properties. Template changes and deletion must not propagate into existing layouts. Saving a piece as a template is explicit. Premade layout templates and physical inventory limits are not required.
- **Multiple tags:** every piece and terrain template supports multiple simultaneous tags, not a mutually exclusive terrain category. A Cover + Difficult + Dense forest belongs to all three tag sets. Tags remain descriptive and independent of colour; the piece also has one explicit visibility behaviour. Premade defaults provide coherent tags and behaviour, and users can override them.
- **Coverage analysis:** calculate the geometric union of terrain footprints clipped to the board, divided by board area. For each tag, union only matching footprints before calculating its coverage. The same area can contribute to multiple tag percentages; their sum may exceed total terrain coverage. Deployment zones are excluded. Apply piece transformations consistently to rendering and analysis.
- **Count analysis:** calculate total terrain piece counts and per-tag piece counts separately from area coverage. Each piece counts once in the total and once for each tag it carries. Overlap does not merge two distinct pieces into one count. Recommendation percentages use piece counts where the source specifies counts, not covered area.
- **Visibility analysis:** provide point-to-point LOS with distance and visibility status, plus a board-wide maximum-LOS search. Clear footprints do not interrupt LOS. Blocking footprints interrupt it, and blocking takes precedence in overlaps. Dense footprints allow sight into and out of them, but not through them to a target beyond. Use one consistent visibility policy for both tools. All LOS is a labelled 2D approximation; sampled global search results must also be identified as approximate.
- **Analysis interfaces:** expose coverage/count results and visibility queries through a small public planner-analysis interface used by the application. Keep numerical geometry operations below that interface. This allows future game-specific policies without encoding every game's terrain semantics into tag names, colours, or Konva objects.
- **Game profiles:** initial named support is Firefight, pinned to Advanced Rulebook v3.6.0. Include Custom game mode without game recommendations. Keep source references, board choices, terrain defaults, deployment definitions, and recommendation policies associated with the selected profile. Future games must state their own approximation limits; additional games and their full rules are not part of this release.
- **Board sizes and resizing:** offer 48 × 48 inch and 36 × 36 inch boards and custom dimensions. On resizing, retain terrain physical dimensions and existing coordinates; do not recenter, rescale, or automatically move pieces. Flag off-board pieces, keep them editable, and exclude off-board footprint portions from coverage, visibility inside the playing area, and exported board imagery.
- **Firefight deployments:** implement all six standard styles from the supplied rulebook's standard-deployment diagrams. The original board is 48 × 48 inches. The user approved the 36-inch adaptations: Frontline has full-width 6-inch-deep zones and a 24-inch gap; Spearhead keeps full-width bases with a 6-inch apex depth; corner-anchored Ground War has 12-inch outer legs and 6-inch steps; Side Battle has 21-by-12-inch right triangles; Disordered has 12-inch corner-triangle legs; Opposing Forces has corner-anchored 12-by-6-inch rectangles. Preserve the original opposing-zone arrangement. These adaptations are application conventions, not published diagrams. Do not impose a universal 24-inch separation rule on all advanced styles, because their source diagrams can permit closer deployments.
- **Firefight terrain defaults:** use the supplied edition's guidelines, including barricades as Cover; buildings and mountains as Impassable + Sight Blocking; fields as Difficult + Cover; forests as Difficult + Cover + Dense; hills as Cover + Steep; lava as Dangerous; rubble and swamps as Difficult; ruins as Cover + Unstable; and walls as Climbable. Shallow/deep water distinctions remain editable properties or template variants. These are suggested properties, not immutable rules. Elevation-related tags do not introduce a 3D visibility model.
- **Firefight recommendations:** distinguish page 6's minimum of 20 pieces and recommendation of 25 or more from page 11's advice to use at least 20–25 pieces. Show the quantity guidance and the piece-count mix targets of at least 50% sight blocking, 33% Cover, and 33% Difficult, plus one Dangerous piece per player (two for the initial opposing-zone setup). Keep published terrain-count targets advisory on 36-inch boards, without invented reductions. Source rules and application metrics must be identified separately.
- **Coverage guidance:** the rulebook's 50% quantity heuristic describes gathering enough terrain to cover half the table before spreading it out. Show measured final-layout union coverage as a useful planning metric, without claiming it exactly reproduces that setup procedure. Do not convert every piece-count target into an area target.
- **Other placement guidance:** identify advice about open edge-to-edge sight lines or terrain spacing as advisory source guidance. Only mark a check automatically evaluated when the application has a defined measurement for it; otherwise state that manual review is needed. Optional placement-mode and tournament spacing rules are not global constraints. Unmet or unevaluated guidance never prevents editing, saving, or export.
- **Local persistence:** store named layouts and custom terrain templates in localStorage. Support autosave, reopening, renaming, independent duplication, and confirmed deletion. No login, server component, or remote persistence is required. PNG/PDF are visual references, not editable backups; JSON import/export is deliberately excluded.
- **Export:** PNG contains board terrain and deployment zones. PDF includes the layout name, board dimensions, terrain key, coverage figures, and recommendation feedback. Include LOS overlays only when the user explicitly enables them. Clip board imagery to the playing surface and omit editor affordances. Export is client-side; PDF composition is separate from Konva rendering.

## Testing Decisions

- **Confirmed testing seams:** use browser-level acceptance tests at the application boundary for complete player workflows, plus targeted tests of the public planner-analysis interface for numerical coverage and LOS behaviour. Keep geometry helper functions and Konva internals below those boundaries rather than testing each separately. The user confirmed both testing boundaries before publication.
- **Good tests:** assert externally observable behaviour and independently known results, not internal component structure, implementation-specific storage keys, helper call sequences, or scene-graph snapshots. Exercise real browser storage and actual exports rather than mocking all collaborators. Prefer a small number of representative user journeys and well-chosen numerical cases.
- **Existing prior art:** the repository currently contains the generated React/Vite application, build/type-check and lint commands, but no test suite, test runner, or established domain-test seams. The proposed tests are new; do not claim existing tests already demonstrate the required behaviour.
- **Application workflow coverage:** exercise choosing a game and board, dragging premade terrain, custom footprint editing, dimensions/rotation/grid use, multiple tags, visibility overrides, deployment selection, and board resizing without moving pieces. Assert visible board state and reported measurements.
- **Persistence and independence:** verify autosave across reloads, saved layout selection and rename, independent duplication, deletion confirmation, undo/redo, and locally persisted terrain templates. Editing or deleting a template must leave existing placed pieces and saved layouts unchanged. Use isolated browser storage for each test.
- **Coverage/count cases:** use known overlapping footprints, nested shapes, rotation, circles, irregular polygons, board-edge clipping, and multi-tag pieces. Check geometric unions separately from counts. For two 4-square-inch pieces overlapping by 2 square inches on a 100-square-inch board, total coverage is 6%; if each carries a different tag, each tag covers 4%, and the total piece count is two. A single piece with three tags counts once overall and once in each tag set. Deployment overlays contribute no terrain area.
- **Visibility cases:** cover clear lines, solid blockers, dense terrain with endpoints inside/outside, passing through dense terrain to a target beyond, and overlapping clear/dense/blocking pieces. Both LOS tools must use consistent semantics. Document and test a consistent boundary/tangency convention instead of relying on incidental renderer behaviour. Known open-board and blocker fixtures bound the maximum-line result; sampled results remain labelled approximate rather than tested as mathematically exact.
- **Recommendations and deployments:** verify count-based thresholds independently from coverage percentages; unmet recommendations never block operations. Check all six 48-inch deployment styles against source-diagram geometry and all six 36-inch styles against the approved adaptations. Frontline's 36-inch version has opposing 6-inch zones and a 24-inch gap. Do not mistakenly apply optional placement or tournament rules globally.
- **Exports:** exercise PNG and PDF downloads; verify valid readable files, required content, clipping, and LOS-overlay opt-in. Test meaningful content and dimensions rather than byte-for-byte raster snapshots or browser-dependent PDF metadata.
- **Build quality:** complete the repository's build/type-check and lint checks alongside the feature tests. Test tooling may be selected during implementation; it must support the agreed application and analysis boundaries.

## Out of Scope

- Gameplay tracking, miniature placement, unit state, movement resolution, and rules adjudication.
- True 3D or miniature-eye-level LOS, terrain heights/windows/floors, exact silhouettes, facing, observer equipment, and other games' complete visibility rules.
- Full tablet/touch editing and mobile-first editing.
- Accounts, authentication, backend services, server storage, cloud sync, and multiplayer collaboration.
- JSON import/export or another editable backup/transfer format.
- Premade or reusable whole-layout templates; players can still duplicate their own saved layouts.
- Physical terrain inventory quantities or availability limits.
- Strategic/asymmetric Firefight deployments, optional terrain generators, tournament-specific setup, and additional named game profiles.
- Automatically enforcing recommendations or declaring a layout officially rules-compliant.

## Further Notes

- The design and deployment adaptations were approved in the conversation. Multiple simultaneous terrain tags were explicitly reaffirmed as a requirement.
- The supplied Firefight source is Advanced Rulebook v3.6.0, especially pages 5–6, 11–12, and 19. Do not silently substitute a newer edition. The original PDF is supplied locally and is not currently tracked in Git; implementation must not depend on a production server fetching it.
- The repository also contains an agreed design document, a domain glossary, a 2D-footprint ADR, an approved six-panel adaptation diagram, and an official-source research note comparing other games. They provide terminology and supporting context. The spec's implementation decisions above intentionally use module responsibilities rather than prescribing file paths.
- Cross-game research informed extensibility, not added release scope: Infinity has silhouette/observer-dependent visibility; Alpha Strike has accumulated terrain-depth blocking; the reviewed Warhammer 40,000 overview combines terrain areas with physical features and conditional visibility. The initial Firefight model must remain explicitly approximate rather than pretending that three visibility behaviours reproduce every game.
- Numerical tolerance, circle approximation where needed for unions, and maximum-LOS sampling strategy are implementation choices. Define them consistently, test known physical results through the public interface, and make any user-visible approximation honest.
- Publishing target: GitHub Issues in rabidgremlin/terrain-layout-planner with the ready-for-agent label. The design and testing boundaries have been confirmed by the user.
