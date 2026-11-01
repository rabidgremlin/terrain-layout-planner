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
**Apply geometry**. Positions refer to the footprint's local top-left;
numeric rotation turns around that origin. The round board handle rotates around
the footprint's centre and updates its position accordingly. Overlaps and
positions outside the board remain allowed.

Units change the displayed measurements only. Geometry stays in inches in saved
layouts; centimetre inputs convert using exactly 2.54 cm per inch. Inputs display
up to eight decimal places, and unchanged fields retain their stored precision.
The optional grid rounds drops and dragged positions to the nearest spacing from
the board origin. Numeric inputs remain exact, even with snapping enabled.

Duplicate creates an independent piece, offset by one grid spacing. Undo and redo
cover placement, movement, geometry edits, duplication, and removal. Each gesture
or Apply action is one step; a new edit clears redo. Layout changes, including undo
and redo, autosave. History and editor preferences last for the current session;
the resulting layout survives reload.

Future terrain editing controls must use `useLayoutHistory` in `src/history.ts`
and commit immutable layout snapshots through the existing editor history.
