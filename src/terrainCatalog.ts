import { tagIds } from './planner'
import type { TerrainTemplate } from './planner'

// Suggested tags: supplied Firefight advanced rules v3.6.0, p.11.
// Dimensions and colours are editable planner choices.
export const terrainCatalog: readonly TerrainTemplate[] = [
  { name: 'Building', footprint: { kind: 'rectangle', width: 6, depth: 4 }, rotation: 0, colour: '#a8b89c', tags: [tagIds.impassable, tagIds.sightBlocking] },
  { name: 'Barricade', footprint: { kind: 'rectangle', width: 3, depth: 1 }, rotation: 0, colour: '#b8ad96', tags: [tagIds.cover] },
  { name: 'Field', footprint: { kind: 'rectangle', width: 6, depth: 4 }, rotation: 0, colour: '#c2bc7b', tags: [tagIds.difficult, tagIds.cover] },
  { name: 'Forest', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#718c63', tags: [tagIds.difficult, tagIds.cover, tagIds.dense] },
  { name: 'Hill', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#b3ab81', tags: [tagIds.cover, tagIds.steep] },
  { name: 'Water', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#81aab8', tags: [tagIds.difficult] },
  { name: 'Lava', footprint: { kind: 'ellipse', width: 4, depth: 4 }, rotation: 0, colour: '#bf704d', tags: [tagIds.dangerous] },
  { name: 'Rubble', footprint: { kind: 'rectangle', width: 4, depth: 4 }, rotation: 0, colour: '#aaa394', tags: [tagIds.difficult] },
  { name: 'Ruin', footprint: { kind: 'rectangle', width: 6, depth: 4 }, rotation: 0, colour: '#a69e8b', tags: [tagIds.cover, tagIds.unstable] },
  { name: 'Swamp', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#8d9972', tags: [tagIds.difficult] },
  { name: 'Mountain', footprint: { kind: 'ellipse', width: 8, depth: 8 }, rotation: 0, colour: '#92958b', tags: [tagIds.impassable, tagIds.sightBlocking] },
  { name: 'Scalable wall', footprint: { kind: 'rectangle', width: 6, depth: 1 }, rotation: 0, colour: '#a9a49b', tags: [tagIds.climbable] },
  { name: 'Tall wall', footprint: { kind: 'rectangle', width: 6, depth: 1 }, rotation: 0, colour: '#a9a49b', tags: [tagIds.impassable, tagIds.sightBlocking] },
]
