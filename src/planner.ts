export type TerrainTag = { id: string; name: string; blocksLos: boolean }
// IDs are permanent catalog references, independent of the editable display names.
export const tagIds = {
  impassable: 'Impassable', sightBlocking: 'Sight Blocking', cover: 'Cover', difficult: 'Difficult',
  dense: 'Dense', steep: 'Steep', dangerous: 'Dangerous', unstable: 'Unstable', climbable: 'Climbable',
} as const
export const suppliedTags = (): TerrainTag[] => [
  { id: tagIds.impassable, name: 'Impassable', blocksLos: false },
  { id: tagIds.sightBlocking, name: 'Sight Blocking', blocksLos: true },
  { id: tagIds.cover, name: 'Cover', blocksLos: false },
  { id: tagIds.difficult, name: 'Difficult', blocksLos: false },
  { id: tagIds.dense, name: 'Dense', blocksLos: true },
  { id: tagIds.steep, name: 'Steep', blocksLos: false },
  { id: tagIds.dangerous, name: 'Dangerous', blocksLos: false },
  { id: tagIds.unstable, name: 'Unstable', blocksLos: false },
  { id: tagIds.climbable, name: 'Climbable', blocksLos: false },
]
export type Game = 'firefight' | 'custom'
export type TerrainPiece = {
  id: string
  name: string
  footprint: { kind: 'rectangle' | 'ellipse'; width: number; depth: number }
  x: number
  y: number
  rotation: number
  colour: string
  tags: string[]
}
export type Layout = {
  version: 2
  game: Game
  board: { width: number; height: number }
  tags: TerrainTag[]
  pieces: TerrainPiece[]
}
export type TerrainTemplate = Omit<TerrainPiece, 'id' | 'x' | 'y'>
export function filterDefinedTagIds(memberships: string[], definitions: TerrainTag[]): string[] {
  const ids = new Set(definitions.map(tag => tag.id))
  return memberships.filter(id => ids.has(id))
}
export function withTagDefinitions(layout: Layout, tags: TerrainTag[]): Layout {
  return { ...layout, tags, pieces: layout.pieces.map(piece => ({ ...piece, tags: filterDefinedTagIds(piece.tags, tags) })) }
}
const storageKey = 'terrain-planner.current-layout.v2'
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
function isLayout(value: unknown): value is Layout {
  if (!value || typeof value !== 'object') return false
  const layout = value as Layout
  return layout.version === 2 && ['firefight', 'custom'].includes(layout.game)
    && !!layout.board && positive(layout.board.width) && positive(layout.board.height)
    && Array.isArray(layout.tags) && layout.tags.every(tag => tag && typeof tag.id === 'string' && typeof tag.name === 'string' && typeof tag.blocksLos === 'boolean')
    && Array.isArray(layout.pieces) && layout.pieces.every(piece => piece && typeof piece.id === 'string'
      && typeof piece.name === 'string' && ['rectangle', 'ellipse'].includes(piece.footprint?.kind)
      && positive(piece.footprint.width) && positive(piece.footprint.depth)
      && finite(piece.x) && finite(piece.y) && finite(piece.rotation) && typeof piece.colour === 'string'
      && Array.isArray(piece.tags) && piece.tags.every(tag => typeof tag === 'string'))
}
export function loadLayout(): { layout: Layout | null; warning: string } {
  try {
    const stored = localStorage.getItem(storageKey)
    localStorage.removeItem('terrain-planner.current-layout.v1')
    if (!stored) return { layout: null, warning: '' }
    const layout: unknown = JSON.parse(stored)
    if (!isLayout(layout)) throw new Error('Invalid layout')
    return { layout, warning: '' }
  } catch {
    return { layout: null, warning: 'Your saved layout could not be loaded. Create a new layout to start again.' }
  }
}
export function saveLayout(layout: Layout): boolean {
  try { localStorage.setItem(storageKey, JSON.stringify(layout)); return true }
  catch { return false }
}
