import type { TerrainTemplate } from './planner'

// Suggested tags: supplied Firefight advanced rules v3.6.0, p.11.
// Dimensions and colours are editable planner choices.
export const terrainCatalog: readonly TerrainTemplate[] = [
  { name: 'Building', footprint: { kind: 'rectangle', width: 6, depth: 4 }, rotation: 0, colour: '#a8b89c', tags: ['Impassable', 'Sight Blocking'] },
  { name: 'Barricade', footprint: { kind: 'rectangle', width: 3, depth: 1 }, rotation: 0, colour: '#b8ad96', tags: ['Cover'] },
  { name: 'Field', footprint: { kind: 'rectangle', width: 6, depth: 4 }, rotation: 0, colour: '#c2bc7b', tags: ['Difficult', 'Cover'] },
  { name: 'Forest', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#718c63', tags: ['Difficult', 'Cover', 'Dense'] },
  { name: 'Hill', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#b3ab81', tags: ['Cover', 'Steep'] },
  { name: 'Water', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#81aab8', tags: ['Difficult'] },
  { name: 'Lava', footprint: { kind: 'ellipse', width: 4, depth: 4 }, rotation: 0, colour: '#bf704d', tags: ['Dangerous'] },
  { name: 'Rubble', footprint: { kind: 'rectangle', width: 4, depth: 4 }, rotation: 0, colour: '#aaa394', tags: ['Difficult'] },
  { name: 'Ruin', footprint: { kind: 'rectangle', width: 6, depth: 4 }, rotation: 0, colour: '#a69e8b', tags: ['Cover', 'Unstable'] },
  { name: 'Swamp', footprint: { kind: 'ellipse', width: 6, depth: 6 }, rotation: 0, colour: '#8d9972', tags: ['Difficult'] },
  { name: 'Mountain', footprint: { kind: 'ellipse', width: 8, depth: 8 }, rotation: 0, colour: '#92958b', tags: ['Impassable', 'Sight Blocking'] },
  { name: 'Wall', footprint: { kind: 'rectangle', width: 6, depth: 1 }, rotation: 0, colour: '#a9a49b', tags: ['Climbable'] },
]
