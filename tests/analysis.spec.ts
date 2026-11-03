import { test, expect } from '@playwright/test'
import { analyzeSightLine } from '../src/plannerAnalysis'
import type { AnalysisLayout } from '../src/plannerAnalysis'

const empty: AnalysisLayout = { board: { width: 48, height: 48 }, tags: [], pieces: [] }

test('an open board has a clear sight line with physical distance', () => {
  expect(analyzeSightLine(empty, { x: 1, y: 2 }, { x: 4, y: 6 })).toEqual({ distance: 5, blocked: false, blockingPieceIds: [] })
})

const rectangle = { id: 'building', x: 10, y: 10, rotation: 0, tags: ['solid'], footprint: { kind: 'rectangle' as const, width: 6, depth: 4 } }
const occupied: AnalysisLayout = { ...empty, tags: [{ id: 'solid', name: 'Arbitrary name', blocksLos: true }], pieces: [rectangle] }

test('a footprint blocks only through its current shared tag flags', () => {
  expect(analyzeSightLine(occupied, { x: 0, y: 12 }, { x: 20, y: 12 })).toEqual({ distance: 20, blocked: true, blockingPieceIds: ['building'] })
  expect(analyzeSightLine({ ...occupied, tags: [{ id: 'solid', name: 'Sight Blocking', blocksLos: false }] }, { x: 0, y: 12 }, { x: 20, y: 12 }).blocked).toBe(false)
  expect(analyzeSightLine({ ...occupied, pieces: [{ ...rectangle, tags: [] }] }, { x: 0, y: 12 }, { x: 20, y: 12 }).blocked).toBe(false)
})

for (const [name, from, to, blocked] of [
  ['crossing', { x: 0, y: 12 }, { x: 20, y: 12 }, true],
  ['open', { x: 0, y: 9 }, { x: 20, y: 9 }, false],
  ['inside start', { x: 12, y: 12 }, { x: 30, y: 30 }, true],
  ['inside end', { x: 30, y: 30 }, { x: 12, y: 12 }, true],
  ['edge', { x: 0, y: 10 }, { x: 20, y: 10 }, true],
  ['corner tangent', { x: 8, y: 12 }, { x: 12, y: 8 }, true],
  ['just outside', { x: 0, y: 9.999999 }, { x: 20, y: 9.999999 }, false],
  ['same point inside', { x: 12, y: 12 }, { x: 12, y: 12 }, true],
  ['same point outside', { x: 0, y: 0 }, { x: 0, y: 0 }, false],
] as const) {
  test(`closed rectangle convention: ${name}`, () => {
    expect(analyzeSightLine(occupied, from, to).blocked).toBe(blocked)
    expect(analyzeSightLine(occupied, to, from).blocked).toBe(blocked)
  })
}

test('rotated rectangles use their footprint rather than an axis-aligned bounding box', () => {
  const layout = { ...occupied, pieces: [{ ...rectangle, rotation: 45, footprint: { kind: 'rectangle' as const, width: 6, depth: 2 } }] }
  expect(analyzeSightLine(layout, { x: 0, y: 13 }, { x: 20, y: 13 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 0, y: 16 }, { x: 20, y: 16 }).blocked).toBe(false)
  expect(analyzeSightLine(layout, { x: 9, y: 15 }, { x: 9, y: 15 }).blocked).toBe(false)
})

test('rotated unequal-axis ellipses include exact tangencies but exclude their bounding-box corners', () => {
  const layout = { ...occupied, pieces: [{ ...rectangle, rotation: 90, footprint: { kind: 'ellipse' as const, width: 8, depth: 4 } }] }
  // This oval is centred at (8,14), with horizontal radius 2 and vertical radius 4.
  expect(analyzeSightLine(layout, { x: 7, y: 11 }, { x: 7, y: 17 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 6, y: 10 }, { x: 6, y: 18 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 5.999999, y: 10 }, { x: 5.999999, y: 18 }).blocked).toBe(false)
  expect(analyzeSightLine(layout, { x: 6.1, y: 10.1 }, { x: 6.1, y: 10.3 }).blocked).toBe(false)
  expect(analyzeSightLine(layout, { x: 8, y: 14 }, { x: 8, y: 14 })).toEqual({ distance: 0, blocked: true, blockingPieceIds: ['building'] })
})

test('concave polygons block their filled arms and boundary, but not the missing notch', () => {
  const layout: AnalysisLayout = { ...occupied, pieces: [{ ...rectangle, footprint: {
    kind: 'polygon', width: 6, depth: 6,
    vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 / 3 }, { x: 1 / 3, y: 1 / 3 }, { x: 1 / 3, y: 1 }, { x: 0, y: 1 }],
  } }] }
  expect(analyzeSightLine(layout, { x: 13, y: 14 }, { x: 15, y: 14 }).blocked).toBe(false)
  expect(analyzeSightLine(layout, { x: 0, y: 11 }, { x: 20, y: 11 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 10.5, y: 15 }, { x: 10.5, y: 15 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 12, y: 12 }, { x: 15, y: 15 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 13, y: 12 }, { x: 15, y: 12 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 13, y: 12.000001 }, { x: 15, y: 12.000001 }).blocked).toBe(false)
  const rotated = { ...layout, pieces: [{ ...layout.pieces[0], x: 20, y: 20, rotation: 90 }] }
  expect(analyzeSightLine(rotated, { x: 15, y: 24 }, { x: 17, y: 24 }).blocked).toBe(false)
  expect(analyzeSightLine(rotated, { x: 19, y: 20 }, { x: 19, y: 26 }).blocked).toBe(true)
})

test('Dense, custom blockers, overlapping non-blockers, and multiple blocking tags use any-tag semantics', () => {
  const layout: AnalysisLayout = { ...occupied,
    tags: [
      { id: 'dense-id', name: 'Dense', blocksLos: true },
      { id: 'custom-id', name: 'Transparent', blocksLos: true },
      { id: 'fake-id', name: 'Sight Blocking', blocksLos: false },
    ],
    pieces: [
      { ...rectangle, id: 'non-blocker', tags: ['fake-id'] },
      { ...rectangle, id: 'forest', tags: ['dense-id', 'custom-id', 'fake-id'] },
      { ...rectangle, id: 'custom', x: 20, tags: ['custom-id'] },
    ],
  }
  expect(analyzeSightLine(layout, { x: 0, y: 12 }, { x: 30, y: 12 })).toEqual({ distance: 30, blocked: true, blockingPieceIds: ['forest', 'custom'] })
  expect(analyzeSightLine(layout, { x: 12, y: 12 }, { x: 18, y: 12 }).blocked).toBe(true)
  expect(analyzeSightLine({ ...layout, tags: layout.tags.map(tag => ({ ...tag, blocksLos: false })) }, { x: 0, y: 12 }, { x: 30, y: 12 }).blocked).toBe(false)
  expect(analyzeSightLine({ ...layout, pieces: [{ ...rectangle, tags: ['unknown'] }] }, { x: 0, y: 12 }, { x: 30, y: 12 }).blocked).toBe(false)
})

test('circles use their curved boundary, including an endpoint or a tangent on the circumference', () => {
  const layout = { ...occupied, pieces: [{ ...rectangle, footprint: { kind: 'ellipse' as const, width: 4, depth: 4 } }] }
  expect(analyzeSightLine(layout, { x: 0, y: 10 }, { x: 20, y: 10 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 12, y: 10 }, { x: 12, y: 0 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 10.1, y: 10.1 }, { x: 10.2, y: 10.2 }).blocked).toBe(false)
})

test('polygon width/depth scaling and negative rotation preserve a triangular footprint', () => {
  const layout: AnalysisLayout = { ...occupied, pieces: [{ ...rectangle, x: 20, y: 20, rotation: -90, footprint: {
    kind: 'polygon', width: 8, depth: 2, vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
  } }] }
  expect(analyzeSightLine(layout, { x: 21, y: 18 }, { x: 21, y: 18 }).blocked).toBe(true)
  expect(analyzeSightLine(layout, { x: 21.5, y: 13 }, { x: 21.5, y: 13 }).blocked).toBe(false)
})

test('only the playable-board portion of a footprint can meet an in-board sight line', () => {
  const layout = { ...occupied, pieces: [{ ...rectangle, x: -2, footprint: { kind: 'rectangle' as const, width: 4, depth: 4 } }] }
  expect(analyzeSightLine(layout, { x: 0, y: 12 }, { x: 5, y: 12 }).blocked).toBe(true)
  expect(analyzeSightLine({ ...layout, pieces: [{ ...rectangle, x: -8 }] }, { x: 0, y: 12 }, { x: 5, y: 12 }).blocked).toBe(false)
  expect(analyzeSightLine(empty, { x: 0, y: 0 }, { x: 48, y: 0 }).distance).toBe(48)
})

test('the public query rejects points outside the playable board and non-finite coordinates', () => {
  for (const point of [{ x: -1, y: 10 }, { x: 49, y: 10 }, { x: 10, y: 49 }, { x: NaN, y: 0 }, { x: 0, y: Infinity }]) {
    expect(() => analyzeSightLine(empty, point, { x: 0, y: 0 })).toThrow(RangeError)
    expect(() => analyzeSightLine(empty, { x: 0, y: 0 }, point)).toThrow(RangeError)
  }
})

test('invalid blocking geometry is rejected rather than reported as clear', () => {
  const invalid = [
    { kind: 'polygon' as const, width: 6, depth: 6, vertices: [] },
    { kind: 'polygon' as const, width: 6, depth: 6, vertices: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 0 }] },
    { kind: 'polygon' as const, width: 6, depth: 6, vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }] },
    { kind: 'rectangle' as const, width: 0, depth: 4 },
    { kind: 'ellipse' as const, width: 6, depth: NaN },
  ]
  for (const footprint of invalid) {
    expect(() => analyzeSightLine({ ...occupied, pieces: [{ ...rectangle, footprint }] }, { x: 0, y: 12 }, { x: 20, y: 12 })).toThrow(RangeError)
  }
})
