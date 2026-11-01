import { create } from 'zustand'
import { temporal } from 'zundo'
import { loadLayout, saveLayout } from './planner'
import type { Layout } from './planner'
import type { Units } from './measurements'

type EditorState = {
  layout: Layout | null
  selected: string | null
  units: Units
  snapping: boolean
  showGrid: boolean
  grid: number
  saved: boolean
  loadWarning: string
  createLayout: (layout: Layout) => void
  commitLayout: (layout: Layout) => void
  setSelected: (selected: string | null) => void
  setUnits: (units: Units) => void
  setSnapping: (snapping: boolean) => void
  setShowGrid: (showGrid: boolean) => void
  setGrid: (grid: number) => void
  undo: () => void
  redo: () => void
}

const initial = loadLayout()

export const useEditorStore = create<EditorState>()(temporal<EditorState, [], [], Pick<EditorState, 'layout'>>((set) => ({
  layout: initial.layout,
  selected: null,
  units: 'in',
  snapping: false,
  showGrid: false,
  grid: 1,
  saved: initial.layout ? saveLayout(initial.layout) : true,
  loadWarning: initial.warning,
  createLayout: layout => {
    set({ layout })
    // Creation establishes the baseline; undo must never restore the setup screen.
    useEditorStore.temporal.getState().clear()
  },
  commitLayout: layout => set({ layout }),
  setSelected: selected => set({ selected }),
  setUnits: units => set({ units }),
  setSnapping: snapping => set({ snapping }),
  setShowGrid: showGrid => set({ showGrid }),
  setGrid: grid => set({ grid }),
  // Parameterless actions also work as DOM handlers: events are not undo step counts.
  undo: () => useEditorStore.temporal.getState().undo(),
  redo: () => useEditorStore.temporal.getState().redo(),
}), {
  partialize: state => ({ layout: state.layout }),
  equality: (past, current) => JSON.stringify(past.layout) === JSON.stringify(current.layout),
}))

// Keep the existing raw Layout storage contract. Zundo restores through the same
// store, so this subscription also saves undo/redo without persisting UI or history.
useEditorStore.subscribe((state, previous) => {
  if (!state.layout || state.layout === previous.layout) return
  const saved = saveLayout(state.layout)
  if (saved !== state.saved) useEditorStore.setState({ saved })
})
