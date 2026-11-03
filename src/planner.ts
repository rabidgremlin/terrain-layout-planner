export type TerrainTag = { id: string; name: string; blocksLos: boolean }
export const suppliedTags = (): TerrainTag[] => ['Impassable', 'Sight Blocking', 'Cover', 'Difficult', 'Dense', 'Steep', 'Dangerous', 'Unstable', 'Climbable'].map(name => ({ id: name, name, blocksLos: name === 'Sight Blocking' || name === 'Dense' }))
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
