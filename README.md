# terrain-layout-planner
Planning tool for testing out wargame board terrain layouts.


```
npm install
npm run dev
```

Site: https://rabidgremlin.github.io/terrain-layout-planner/

## Checks

```sh
npm run typecheck
npm run lint
npm run build
npx playwright install --with-deps chromium
npm test
```

The browser tests start the Vite development server and use isolated browser
storage. Layouts autosave in the current browser; no account or server is needed.

## Precise terrain editing

The right-hand terrain list shows the pieces on the board. Select a piece from
the list or board to open its properties panel below the list; deselecting hides
the properties panel. Enter its width, height, position, and rotation, then choose
**Apply**. Circular pieces use a single diameter so they remain circular. Positions refer to the footprint's local top-left;
numeric rotation turns around that origin. The round board handle rotates around
the footprint's centre and updates its position accordingly. Hold Ctrl while
dragging the rotation handle to snap to the nearest 15 degrees; release Ctrl
to return to free rotation during the same drag. This is independent of grid
visibility and position snapping. Overlaps and positions outside the board
remain allowed.

Units change the displayed measurements only. Geometry stays in inches in saved
layouts; centimetre inputs convert using exactly 2.54 cm per inch. Inputs display
up to eight decimal places, and unchanged fields retain their stored precision.
The top toolbar provides undo, redo, duplicate, delete, units, and grid spacing controls.
The grid icon toggles grid visibility; the magnet icon independently toggles
snapping. Snapping rounds drops and dragged positions to the nearest spacing
from the board origin, even when the grid is hidden. Numeric inputs remain exact,
even with snapping enabled.

Use Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z or Ctrl+Y to redo, and Delete or
Backspace to delete selected terrain. These shortcuts leave focused inputs,
selectors, and editable text to their normal keyboard editing. Toolbar tooltips
also show the shortcuts.

Duplicate creates an independent piece, offset by one grid spacing. Undo and redo
cover placement, movement, geometry edits, duplication, and removal. Each gesture
or Apply action is one step; a new edit clears redo. Layout changes, including undo
and redo, autosave. History and editor preferences last for the current session;
the resulting layout survives reload.

Shared editor state lives in the Zustand store in `src/editorStore.ts`. Zundo
tracks only the layout; selection, units, grid preferences, and save status stay
outside undo history. Form drafts, validation, DOM/Konva references, drag previews,
and measured viewport dimensions remain component-local.

Future terrain editing controls must call the store's `commitLayout` action with
an immutable layout snapshot. Use `createLayout` only to establish a fresh history
baseline, and the parameterless `undo`/`redo` actions for toolbar or shortcut
handlers. Subscribe to Zundo's temporal store for reactive history availability;
do not introduce another undo mechanism. Selection and preference setters must
not create history entries or clear redo. Unchanged layouts are ignored by
history equality checks.

Storage continues to contain the raw version-1 layout at
`terrain-planner.current-layout.v1`. The editor store loads it once per session
and autosaves layout changes, including undo/redo, through the existing validated
storage boundary. UI preferences and history are not persisted. Browser tests
cover compatibility with existing saves and preference/no-op history behaviour.

## Terrain catalog and properties

The terrain library provides buildings, barricades, fields, forests, hills, water,
lava, rubble, ruins, swamps, mountains, and walls. Drag a template's footprint or
card onto the board. Circles retain the same local top-left positioning and
rotation convention as rectangles; their width and height are the same diameter
in saved layouts. Existing version-1 rectangular layouts remain compatible.

Catalog tags follow the supplied Firefight advanced rules v3.6.0, page 11.
Dimensions, colours, and explicit 2D visibility defaults are planner choices,
not prescribed terrain sizes or a substitute for agreeing terrain rules.
Water defaults to a shallow lake (Difficult); walls default to Blocking visibility
and Climbable. Buildings and mountains default to Blocking, forests to Dense,
and the other choices to Clear. All pieces allow overrides.

Select a placed piece to edit its colour, visibility behaviour, and any number of
tags along with its geometry, then choose **Apply**. Use **New tag** and **Add tag**
(or Enter) to add a custom tag to the draft. Names are trimmed; existing names are
reused without regard to case. Applied tags are available for reuse on other
pieces in the same layout. Check or uncheck tags to change membership. Tags and
colour never determine visibility; only the explicit Clear/Blocking/Dense
setting does. Dense permits sight into or out of a footprint, but not through it.
These settings describe a 2D planning approximation, not miniature-eye-level LOS.

Each Apply is one shared undo/redo step and autosaves all piece properties.
Editing a placement or duplicate leaves other pieces and the catalog unchanged.
Draft changes remain local until Apply and reset when selection or units change.

## Styling

Use Tailwind utilities through `@tailwindcss/vite` for all component styling.
Keep complete utility names in JSX or shared class strings (`src/uiStyles.ts`);
do not build utility names from fragments. Use the existing exact colours and
sizes when extending the interface rather than changing the palette or spacing.

`src/index.css` imports Tailwind's theme and utilities deliberately **without
Preflight**. This preserves browser heading weights and margins, paragraph/list
margins, native control appearance, and inline SVG/canvas layout. The small base
layer owns the page font, colours, box sizing, inherited control fonts, disabled
buttons, and visible keyboard focus. Component layout and appearance belong in
utilities; new component selectors and `@apply` rules do not belong in that file.
Since there is no border reset, directional borders need `border-0` before their
side-specific width and `border-solid` utilities. The `compact:` and `narrow:`
variants preserve the original inclusive 800px and 1100px breakpoints.

Inline DOM styles are reserved for runtime board/preview dimensions and terrain
colours. Konva rendering properties remain in the rendering layer. Keep physical
geometry, board fitting, and screen-to-board conversion independent of styling.

`tests/appearance.spec.ts` compares 22 screenshots against the approved
Chromium/Linux appearance at 1280px, 1000px, and 800px: setup, custom fields,
selected/deselected terrain, toolbar toggles, hover, keyboard focus, and compact
save-failure feedback. The original Tailwind migration baselines were updated
for the expanded catalog and properties controls in #5. Run `npx playwright test tests/appearance.spec.ts` to
compare; inspect differences before intentionally updating any baselines. Browser
rendering can differ across operating systems, so run these baselines on Linux.
