import type { RefObject } from 'react'
import type { TerrainTemplate } from './planner'

type TerrainDrag = { template: TerrainTemplate; x: number; y: number; image: HTMLElement | null }
export type TerrainDragRef = RefObject<TerrainDrag | null>

export function clearTerrainDrag(dragRef: TerrainDragRef) {
  dragRef.current?.image?.remove()
  dragRef.current = null
}
