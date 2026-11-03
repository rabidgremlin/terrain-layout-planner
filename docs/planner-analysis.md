# Planner analysis

`src/plannerAnalysis.ts` is the public, rendering-independent boundary for numerical
planning queries. Application code and analysis tests use this module; numerical
intersection operations remain below it in `src/geometry.ts`.

## Point-to-point line of sight

`analyzeSightLine(layout, from, to)` accepts a board, layout-owned tag definitions,
and placed footprints. The existing `Layout` can be passed directly. Points,
positions, board dimensions, footprint width/depth and returned distance use
physical inches; rotation uses clockwise degrees in the board's downward Y axis.
Unit conversion belongs to the display layer.

The result contains `distance`, `blocked`, and `blockingPieceIds`. Each intersected
blocking piece appears once, even when several of its tags block. Names, colours,
selection handles, grid lines and other overlays do not participate. A piece
blocks when any assigned definition currently has `blocksLos: true`. Missing or
non-blocking memberships do not block or cancel other pieces. Dense has no
separate behavior or endpoint exception.

Endpoints must be finite and inside the closed playable-board rectangle;
invalid endpoints or board dimensions throw `RangeError`. Since that rectangle
is convex, the segment stays inside it. Footprints extending beyond the board
therefore affect the query only where the in-board segment meets them.

Footprints are **closed obstacles**: touching an edge, corner or tangent is
blocked, as is starting or ending inside or on a blocker. Coincident endpoints
have zero distance and are blocked exactly when that point touches a blocker.
Numerical comparisons use a small `1e-9` tolerance in their working coordinates
(local inches for straight boundaries, normalized circle coordinates for ellipses).
This is a top-down 2D planning approximation, deliberately simplifying Firefight
Dense rules; it does not adjudicate miniature-eye-level visibility.

## Supported footprints and the polygon seam

Rectangles occupy local `(0,0)` to `(width,depth)`. Ellipses occupy that same frame,
with their centre at `(width/2,depth/2)`; equal axes represent circles. Both rotate
about the local top-left origin before translation by the piece's `x,y`, matching
the editor's physical transforms.

The public `AnalysisFootprint` additionally accepts a polygon:

```ts
{
  kind: 'polygon',
  width: 8,
  depth: 2,
  vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
}
```

Vertices are normalized to the unrotated width/depth frame: `(1,1)` maps to
`(width,depth)`. Rings close implicitly, support either winding and concavity,
and must be simple and non-degenerate, with at least three distinct vertices and
no holes or repeated closing vertex. Invalid blocking footprints throw
`RangeError` rather than silently yielding clear LOS.

This analysis contract provides polygon support for issue #13 independently of
issue #6. Polygon drawing, editing, and extending the persisted/editor footprint
contract remain work for #6. Maximum-LOS search and coverage queries remain
separate follow-on features.
