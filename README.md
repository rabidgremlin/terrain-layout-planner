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
the properties panel. Enter its width, depth, position, and rotation, then choose
**Apply**. Oval pieces have independent width and depth; equal dimensions make
a circle. Positions refer to the footprint's local top-left;
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

Storage contains the raw version-2 layout at
`terrain-planner.current-layout.v2`. The editor store loads it once per session
and autosaves layout changes, including undo/redo, through the existing validated
storage boundary. UI preferences and history are not persisted. Browser tests
cover storage and preference/no-op history behaviour.

## Terrain catalog and properties

The terrain library offers rectangles and ovals with independent width and depth.
Drag a template onto the board, then select a piece to edit its geometry, colour,
and tag memberships. Choose **Apply** to commit these changes together.

Open **Layout settings** in the toolbar to add or rename supplied and custom tags,
change their **Blocks LOS** flags, or delete them. Deletion asks for confirmation
and shows how many placed pieces are affected. Save removes the tag memberships
and catalog associations in this layout; later placements do not recreate them.
Renaming preserves memberships and catalog associations. Changes remain a draft until **Save**; **Cancel** discards them. Names are
trimmed and must be unique ignoring case. A piece blocks line of sight if any of
its assigned tags blocks. Sight Blocking and Dense block by default; other supplied
tags do not. Dense is treated as a solid obstacle in this two-dimensional planning
approximation. Each settings Save is one shared undo/redo step, including deleted
memberships; undo restores the definitions and their associations. New placements use the current layout's shared tag rules.

The **Scalable wall** and **Tall wall** presets both start as editable 6-inch by
1-inch rectangles. Scalable walls carry Climbable and do not block LOS with fresh
defaults; tall walls carry Impassable and Sight Blocking and do block. These are
editable planner presets under the two-dimensional approximation, rather than
prescribed physical sizes or a numeric terrain-height model. Both follow this
layout's current tag names, memberships and blocking rules. Source rule findings
remain in the research documentation.

Layouts use version 2 storage. Older planner saves are reset rather than migrated.
See [ADR 0002](docs/adr/0002-derive-los-blocking-from-layout-tags.md) for the model.

Each Apply is one shared undo/redo step and autosaves all piece properties.
Editing a placement or duplicate leaves other pieces and the catalog unchanged.
Draft changes remain local until Apply and reset when selection or units change.

## Point-to-point line of sight

Use **Measure line of sight** in the toolbar and click two board points. The panel
to the right of the board shows Clear or Blocked and the distance in the selected
units. Blocked lines are red and dashed; clear lines are green and solid. A third
click starts a new measurement; **Clear line** resets it and Escape exits the tool.

The result updates after committed terrain or shared-tag edits and undo/redo.
Measuring consumes no layout history and does not save the measurement. Blocking
footprints are solid: endpoints inside them and contact with an edge or tangent
are blocked. This top-down 2D planning approximation deliberately simplifies
Firefight Dense rules and does not adjudicate miniature-eye-level visibility.

See [Planner analysis](docs/planner-analysis.md) for the public numerical interface,
physical-coordinate conventions, and polygon support ahead of the polygon editor.

## Styling

Use Tailwind utilities through `@tailwindcss/vite` for all component styling.
Keep complete utility names in JSX or shared class strings (`src/uiStyles.ts`);
do not build utility names from fragments. Use the existing exact colours and
sizes when extending the interface rather than changing the palette or spacing.
The blocked LOS overlay uses `#a44132` red to distinguish it from clear sight lines.

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

`tests/appearance.spec.ts` compares screenshots against the approved
Chromium/Linux appearance at 1280px, 1000px, and 800px: setup, custom fields,
selected/deselected terrain, wall presets, tag management, toolbar toggles, hover,
keyboard focus, point-to-point sight lines, and compact
save-failure feedback. The original Tailwind migration baselines were updated
for the expanded catalog and properties controls in #5. Run `npx playwright test tests/appearance.spec.ts` to
compare; inspect differences before intentionally updating any baselines. A small
colour tolerance ignores antialiased border rounding; no differing pixels beyond
that tolerance are allowed. Browser
rendering can differ across operating systems, so run these baselines on Linux.
