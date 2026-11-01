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
**Apply**. Positions refer to the footprint's local top-left;
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
