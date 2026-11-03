import { useEffect, useMemo, useState } from 'react'
import type { RefObject } from 'react'
import type { Layout } from './planner'
import { analyzeSightLine } from './plannerAnalysis'
import type { Point } from './plannerAnalysis'

export function useSightLine(layout: Layout | null, boardRef: RefObject<HTMLDivElement | null>, triggerRef: RefObject<HTMLButtonElement | null>) {
  const [active, setActive] = useState(false)
  const [selection, setSelection] = useState<{ from: Point; to: Point | null } | null>(null)
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
  }
  function choose(point: Point) {
    if (!layout || !active) return
    const next = { x: Math.max(0, Math.min(layout.board.width, point.x)), y: Math.max(0, Math.min(layout.board.height, point.y)) }
    setSelection(current => current && !current.to ? { ...current, to: next } : { from: next, to: null })
    boardRef.current?.focus({ preventScroll: true })
  }
  function clear() { setSelection(null); boardRef.current?.focus({ preventScroll: true }) }
  return { active, selection, result, toggle, choose, clear }
}

export type SightLineTool = ReturnType<typeof useSightLine>
