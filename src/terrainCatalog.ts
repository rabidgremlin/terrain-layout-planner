import type { TerrainTemplate } from './planner'

// Suggested tags: supplied Firefight advanced rules v3.6.0, p.11.
// Dimensions, colours and 2D visibility defaults are editable planner choices.
export const terrainCatalog: readonly TerrainTemplate[] = [
  { name: 'Building', footprint: { kind: 'rectangle', width: 6, height: 4 }, rotation: 0, colour: '#a8b89c', tags: ['Impassable', 'Sight Blocking'], visibility: 'blocking' },
  { name: 'Barricade', footprint: { kind: 'rectangle', width: 3, height: 1 }, rotation: 0, colour: '#b8ad96', tags: ['Cover'], visibility: 'clear' },
  { name: 'Field', footprint: { kind: 'rectangle', width: 6, height: 4 }, rotation: 0, colour: '#c2bc7b', tags: ['Difficult', 'Cover'], visibility: 'clear' },
  { name: 'Forest', footprint: { kind: 'ellipse', width: 6, height: 6 }, rotation: 0, colour: '#718c63', tags: ['Difficult', 'Cover', 'Dense'], visibility: 'dense' },
  { name: 'Hill', footprint: { kind: 'ellipse', width: 6, height: 6 }, rotation: 0, colour: '#b3ab81', tags: ['Cover', 'Steep'], visibility: 'clear' },
  { name: 'Water', footprint: { kind: 'ellipse', width: 6, height: 6 }, rotation: 0, colour: '#81aab8', tags: ['Difficult'], visibility: 'clear' },
  { name: 'Lava', footprint: { kind: 'ellipse', width: 4, height: 4 }, rotation: 0, colour: '#bf704d', tags: ['Dangerous'], visibility: 'clear' },
  { name: 'Rubble', footprint: { kind: 'rectangle', width: 4, height: 4 }, rotation: 0, colour: '#aaa394', tags: ['Difficult'], visibility: 'clear' },
  { name: 'Ruin', footprint: { kind: 'rectangle', width: 6, height: 4 }, rotation: 0, colour: '#a69e8b', tags: ['Cover', 'Unstable'], visibility: 'clear' },
  { name: 'Swamp', footprint: { kind: 'ellipse', width: 6, height: 6 }, rotation: 0, colour: '#8d9972', tags: ['Difficult'], visibility: 'clear' },
  { name: 'Mountain', footprint: { kind: 'ellipse', width: 8, height: 8 }, rotation: 0, colour: '#92958b', tags: ['Impassable', 'Sight Blocking'], visibility: 'blocking' },
  { name: 'Wall', footprint: { kind: 'rectangle', width: 6, height: 1 }, rotation: 0, colour: '#a9a49b', tags: ['Climbable'], visibility: 'blocking' },
]
