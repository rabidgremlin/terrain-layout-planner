import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import type { Layout } from './planner'
import { analyzeSightLine } from './plannerAnalysis'
import type { Point } from './plannerAnalysis'
import { unitFactor } from './measurements'
import type { Units } from './measurements'

export function useSightLine(layout: Layout | null, units: Units, boardRef: RefObject<HTMLDivElement | null>, triggerRef: RefObject<HTMLButtonElement | null>) {
  const [active, setActive] = useState(false)
  const [selection, setSelection] = useState<{ from: Point; to: Point | null } | null>(null)
  const [cursor, setCursor] = useState<Point | null>(null)
  const result = useMemo(() => layout && selection?.to ? analyzeSightLine(layout, selection.from, selection.to) : null, [layout, selection])
  useEffect(() => { if (active) boardRef.current?.focus({ preventScroll: true }) }, [active, boardRef])
  useEffect(() => {
    function onEscape(event: globalThis.KeyboardEvent) {
      if (!active || event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
      if (event.target instanceof Element && event.target.closest('dialog[open]')) return
      event.preventDefault(); setActive(false); setSelection(null); triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [active, triggerRef])
  function toggle() {
    if (!layout) return
    setActive(!active); setSelection(null)
    setCursor({ x: layout.board.width / 2, y: layout.board.height / 2 })
  }
  function clamp(point: Point): Point {
    return { x: Math.max(0, Math.min(layout!.board.width, point.x)), y: Math.max(0, Math.min(layout!.board.height, point.y)) }
  }
  function choose(point: Point) {
    if (!layout || !active) return
    const next = clamp(point)
    setSelection(current => current && !current.to ? { ...current, to: next } : { from: next, to: null })
    setCursor(next)
    boardRef.current?.focus({ preventScroll: true })
  }
  function clear() { setSelection(null); boardRef.current?.focus({ preventScroll: true }) }
  function onBoardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!active || !layout || !cursor || event.ctrlKey || event.metaKey || event.altKey) return
    const step = (event.shiftKey ? 0.1 : 1) / unitFactor(units)
    const directions: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } }
    const direction = directions[event.key]
    if (direction) { event.preventDefault(); setCursor(clamp({ x: cursor.x + direction.x, y: cursor.y + direction.y })) }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(cursor) }
  }
  return { active, selection, cursor, result, toggle, choose, clear, onBoardKeyDown }
}

export type SightLineTool = ReturnType<typeof useSightLine>
