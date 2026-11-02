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
  visibility: 'clear' | 'blocking' | 'dense'
}
export type Layout = {
  version: 1
  game: Game
  board: { width: number; height: number }
  pieces: TerrainPiece[]
}
export type TerrainTemplate = Omit<TerrainPiece, 'id' | 'x' | 'y'>
const storageKey = 'terrain-planner.current-layout.v1'
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
function isLayout(value: unknown): value is Layout {
  if (!value || typeof value !== 'object') return false
  const layout = value as Layout
  return layout.version === 1 && ['firefight', 'custom'].includes(layout.game)
    && !!layout.board && positive(layout.board.width) && positive(layout.board.height)
    && Array.isArray(layout.pieces) && layout.pieces.every(piece => piece && typeof piece.id === 'string'
      && typeof piece.name === 'string' && ['rectangle', 'ellipse'].includes(piece.footprint?.kind)
      && positive(piece.footprint.width) && positive(piece.footprint.depth)
      && finite(piece.x) && finite(piece.y) && finite(piece.rotation) && typeof piece.colour === 'string'
      && Array.isArray(piece.tags) && piece.tags.every(tag => typeof tag === 'string')
      && ['clear', 'blocking', 'dense'].includes(piece.visibility))
}
export function loadLayout(): { layout: Layout | null; warning: string } {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return { layout: null, warning: '' }
    // Normalize legacy footprint names before validating; board height stays unchanged.
    const layout: unknown = JSON.parse(stored, (key, value: unknown) => {
      if (key !== 'footprint' || !value || typeof value !== 'object') return value
      const { height, depth, ...footprint } = value as Record<string, unknown>
      return { ...footprint, depth: 'depth' in value ? depth : height,
        kind: footprint.kind === 'circle' ? 'ellipse' : footprint.kind }
    })
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
