import type { Layout, TerrainPiece, TerrainTag } from './planner'
import { segmentIntersectsFootprint } from './geometry'
import type { Footprint, Point } from './geometry'

export type { Point } from './geometry'
export type AnalysisFootprint = Footprint
export type AnalysisPiece = Pick<TerrainPiece, 'id' | 'x' | 'y' | 'rotation'> & { footprint: AnalysisFootprint; tags: readonly string[] }
export type AnalysisLayout = { board: Layout['board']; tags: readonly TerrainTag[]; pieces: readonly AnalysisPiece[] }
export type SightLineResult = { distance: number; blocked: boolean; blockingPieceIds: string[] }

export function analyzeSightLine(layout: AnalysisLayout, from: Point, to: Point): SightLineResult {
  if (![layout.board.width, layout.board.height].every(value => Number.isFinite(value) && value > 0)) throw new RangeError('Board dimensions must be finite and positive.')
  for (const point of [from, to]) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > layout.board.width || point.y < 0 || point.y > layout.board.height) {
      throw new RangeError('Sight-line endpoints must be finite points inside the playable board, including its boundary.')
    }
  }
  const blockingTags = new Set(layout.tags.filter(tag => tag.blocksLos).map(tag => tag.id))
  const blockingPieceIds = layout.pieces.filter(piece => piece.tags.some(id => blockingTags.has(id)) && segmentIntersectsFootprint(from, to, piece)).map(piece => piece.id)
  return { distance: Math.hypot(to.x - from.x, to.y - from.y), blocked: blockingPieceIds.length > 0, blockingPieceIds }
}
