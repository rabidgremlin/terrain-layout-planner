import { useState } from 'react'
import type { Layout } from './planner'

// All layout mutations share this history, including future terrain properties.
// Snapshots are immutable; editor preferences and selection are not layout edits.
export function useLayoutHistory(initial: Layout | null) {
  const [history, setHistory] = useState<{ past: Layout[]; present: Layout | null; future: Layout[] }>({ past: [], present: initial, future: [] })
  function commit(next: Layout) {
    setHistory(current => {
      if (JSON.stringify(current.present) === JSON.stringify(next)) return current
      return { past: current.present ? [...current.past, current.present] : [], present: next, future: [] }
    })
  }
  function undo() {
    setHistory(current => {
      const previous = current.past.at(-1)
      if (!previous || !current.present) return current
      return { past: current.past.slice(0, -1), present: previous, future: [current.present, ...current.future] }
    })
  }
  function redo() {
    setHistory(current => {
      const next = current.future[0]
      if (!next || !current.present) return current
      return { past: [...current.past, current.present], present: next, future: current.future.slice(1) }
    })
  }
  return { layout: history.present, commit, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 }
}
