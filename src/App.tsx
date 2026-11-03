import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Ellipse, Line, Transformer } from 'react-konva'
import Konva from 'konva'
import { useStore } from 'zustand'
import { useEditorStore } from './editorStore'
import { TerrainProperties } from './TerrainProperties'
import { measurement, unitFactor } from './measurements'
import type { Units } from './measurements'
import { TerrainLibrary } from './TerrainLibrary'
import { clearTerrainDrag } from './terrainDrag'
import type { TerrainDragRef } from './terrainDrag'
import type { Game, TerrainPiece, TerrainTemplate } from './planner'
import { LayoutSettings } from './LayoutSettings'
import { suppliedTags } from './planner'
import { fieldControl, setupLabel } from './uiStyles'

const toolbarButton = 'grid place-items-center size-8 p-0 border border-solid border-transparent rounded-[5px] bg-transparent text-[#465c42] enabled:hover:bg-[#e9eddf] aria-pressed:border-[#90a587] aria-pressed:bg-[#dce6d2] aria-pressed:text-[#285849]'
const toolbarGroup = 'flex gap-1'
const toolbarDivider = 'border-0 border-l border-solid border-[#d8ddd1] pl-3 narrow:pl-2'
const toolbarLabel = 'flex items-center gap-1.5 m-0 text-[11px] font-semibold whitespace-nowrap'
const eyebrow = 'm-0 text-[10px] leading-[1.6] tracking-[2px] font-bold'
const panel = 'min-h-0 overflow-y-auto p-4 border border-solid border-[#d9decf] rounded-lg bg-[#fffef9]'
const panelHeading = 'mt-2 mb-3 text-[15px]'
const panelText = 'text-[12px] leading-[1.6] text-[#73806b]'

const rotationSnapAngles = Array.from({ length: 24 }, (_, index) => index * 15)

function ToolbarIcon({ path }: { path: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
}

function App() {
  const {
    layout, selected, units, snapping, showGrid, grid, saved, loadWarning,
    createLayout, commitLayout: updateLayout, undo, redo,
    setSelected, setUnits, setSnapping, setShowGrid, setGrid,
  } = useEditorStore()
  const canUndo = useStore(useEditorStore.temporal, state => state.pastStates.length > 0)
  const canRedo = useStore(useEditorStore.temporal, state => state.futureStates.length > 0)
  const transformerRef = useRef<Konva.Transformer>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsTrigger = useRef<HTMLButtonElement>(null)
  const [game, setGame] = useState<Game>('firefight')
  const [size, setSize] = useState('48')
  const [width, setWidth] = useState('48')
  const [height, setHeight] = useState('48')
  const [formError, setFormError] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const terrainDragRef: TerrainDragRef = useRef(null)
  const [availableSize, setAvailableSize] = useState({ width: 720, height: 720 })
  const hasLayout = layout !== null
  useEffect(() => {
    const node = layerRef.current?.findOne(`#piece-${selected}`)
    transformerRef.current?.nodes(node ? [node] : [])
  }, [selected, layout])
  useEffect(() => {
    function updateRotationSnapping(event: MouseEvent) {
      transformerRef.current?.rotationSnaps(event.ctrlKey ? rotationSnapAngles : [])
    }
    // Update before Konva handles each rotation move, including outside the board.
    window.addEventListener('mousemove', updateRotationSnapping, true)
    return () => window.removeEventListener('mousemove', updateRotationSnapping, true)
  }, [])
  const snap = (value: number) => snapping ? Math.round(value / grid) * grid : value
  function editPiece(next: TerrainPiece) {
    if (layout) updateLayout({ ...layout, pieces: layout.pieces.map(piece => piece.id === next.id ? next : piece) })
  }
  useEffect(() => {
    if (!hasLayout || !boardRef.current) return
    const observer = new ResizeObserver(([entry]) => setAvailableSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(boardRef.current)
    return () => observer.disconnect()
  }, [hasLayout])
  const scale = layout ? Math.min(availableSize.width / layout.board.width, availableSize.height / layout.board.height, 720 / layout.board.width, 720 / layout.board.height) : 1
  const selectedPiece = layout?.pieces.find(piece => piece.id === selected)
  function place(template: TerrainTemplate, x: number, y: number) {
    if (!layout) return
    const piece: TerrainPiece = { ...structuredClone(template), id: crypto.randomUUID(), x: snap(x), y: snap(y) }
    updateLayout({ ...layout, pieces: [...layout.pieces, piece] })
    setSelected(piece.id)
  }
  const deleteSelectedTerrain = useCallback(() => {
    if (layout && selectedPiece) updateLayout({ ...layout, pieces: layout.pieces.filter(piece => piece.id !== selectedPiece.id) })
  }, [layout, selectedPiece, updateLayout])
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!layout || settingsOpen || event.defaultPrevented || event.isComposing || event.altKey) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return
      const key = event.key.toLowerCase()
      const modifier = event.ctrlKey || event.metaKey
      let action: (() => void) | undefined
      if (modifier && key === 'z') {
        if (event.shiftKey ? canRedo : canUndo) action = event.shiftKey ? redo : undo
      } else if (event.ctrlKey && !event.metaKey && !event.shiftKey && key === 'y' && canRedo) {
        action = redo
      } else if (!modifier && !event.shiftKey && (key === 'delete' || key === 'backspace') && selectedPiece) {
        action = deleteSelectedTerrain
      }
      if (action) { event.preventDefault(); action() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [layout, settingsOpen, selectedPiece, canUndo, canRedo, undo, redo, deleteSelectedTerrain])
  return <main className={`max-w-[1440px] mx-auto px-6 py-4 compact:p-3 ${hasLayout ? 'h-dvh grid grid-rows-[48px_minmax(0,1fr)] gap-4' : ''}`}>
    <header className={`flex items-center min-h-12 border-0 border-b border-solid border-[#d8ddd1] ${hasLayout ? 'gap-3 min-w-0 overflow-x-auto narrow:gap-2' : 'gap-4 compact:gap-2'}`}>
      <span className={`text-[24px] text-[#496953] ${hasLayout ? 'narrow:hidden' : 'compact:hidden'}`} aria-hidden="true">▧</span><h1 className={`m-0 tracking-[-.6px] whitespace-nowrap ${hasLayout ? 'shrink-0 text-[16px] narrow:text-[14px]' : 'text-[18px] compact:text-[14px]'}`}>Terrain layout planner</h1>
      {layout && <><h2 className="m-0 shrink-0 pl-3 border-0 border-l border-solid border-[#d8ddd1] text-[14px] tracking-normal whitespace-nowrap narrow:text-[13px] narrow:pl-2">{layout.game === 'firefight' ? 'Firefight' : 'Custom game'} · {measurement(layout.board.width, units)} × {measurement(layout.board.height, units)}</h2><div role="toolbar" aria-label="Terrain editing" className="flex items-center gap-3 ml-auto shrink-0 narrow:gap-2">
          <div className={toolbarGroup}>
            <button ref={settingsTrigger} className={toolbarButton} type="button" aria-label="Layout settings" title="Layout settings" onClick={() => setSettingsOpen(true)}><ToolbarIcon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19 12l2-1-2-4-2 1-2-1-1-2h-4L9 7 7 8 5 7l-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z" /></button>
            <button className={toolbarButton} type="button" aria-label="Undo" aria-keyshortcuts="Control+z Meta+z" title="Undo (Ctrl/Cmd+Z)" onClick={undo} disabled={!canUndo}><ToolbarIcon path="M9 4 4 9l5 5 M4 9h10a6 6 0 0 1 0 12" /></button>
            <button className={toolbarButton} type="button" aria-label="Redo" aria-keyshortcuts="Control+Shift+z Meta+Shift+z Control+y" title="Redo (Ctrl/Cmd+Shift+Z or Ctrl+Y)" onClick={redo} disabled={!canRedo}><ToolbarIcon path="m15 4 5 5-5 5 M20 9H10a6 6 0 0 0 0 12" /></button>
            <button className={toolbarButton} type="button" aria-label="Duplicate terrain" title="Duplicate selected terrain" disabled={!selectedPiece} onClick={() => {
              if (!selectedPiece) return
              const copy = structuredClone(selectedPiece)
              copy.id = crypto.randomUUID(); copy.x = snap(copy.x + grid); copy.y = snap(copy.y + grid)
              updateLayout({ ...layout, pieces: [...layout.pieces, copy] }); setSelected(copy.id)
            }}><ToolbarIcon path="M9 9h12v12H9z M5 15H3V3h12v2" /></button>
            <button className={toolbarButton} type="button" aria-label="Delete terrain" aria-keyshortcuts="Delete Backspace" title="Delete selected terrain (Delete or Backspace)" disabled={!selectedPiece} onClick={deleteSelectedTerrain}><ToolbarIcon path="M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7" /></button>
          </div>
          <div className={`${toolbarGroup} ${toolbarDivider}`}>
            <button className={toolbarButton} type="button" aria-label="Show grid" title="Show grid" aria-pressed={showGrid} onClick={() => setShowGrid(!showGrid)}><ToolbarIcon path="M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18" /></button>
            <button className={toolbarButton} type="button" aria-label="Snap to grid" title="Snap to grid" aria-pressed={snapping} onClick={() => setSnapping(!snapping)}><ToolbarIcon path="M6 3v9a6 6 0 0 0 12 0V3h-4v9a2 2 0 0 1-4 0V3z M6 7h4 M14 7h4" /></button>
          </div>
          <label className={toolbarLabel}>Units<select className={`${fieldControl} p-1.5 h-8 text-[12px] w-[104px]`} value={units} onChange={event => setUnits(event.target.value as Units)}><option value="in">Inches</option><option value="cm">Centimetres</option></select></label>
          <label className={toolbarLabel}>Grid ({units})<input className={`${fieldControl} p-1.5 h-8 text-[12px] w-16`} aria-label={`Grid spacing (${units})`} key={units + grid} type="number" min={0.01 * unitFactor(units)} step="any" defaultValue={Number((grid * unitFactor(units)).toFixed(8))} onBlur={event => {
            const value = Number(event.target.value) / unitFactor(units)
            if (Number.isFinite(value) && value >= 0.01) setGrid(value)
            else event.target.value = String(grid * unitFactor(units))
          }} /></label>
        </div><span role="status" className={`shrink-0 max-w-60 text-[#65765b] text-[12px] ${saved ? 'narrow:absolute narrow:size-px narrow:p-0 narrow:overflow-hidden narrow:[clip-path:inset(50%)] narrow:whitespace-nowrap' : 'narrow:absolute narrow:right-6 narrow:top-16 narrow:max-w-[calc(100vw-48px)] narrow:z-1 narrow:px-3 narrow:py-2 narrow:bg-[#fffef9] narrow:border narrow:border-solid narrow:border-[#c7d0bc] narrow:rounded-[5px]'}`}>{saved ? 'Saved locally' : 'Could not save — browser storage is unavailable'}</span></>}
    </header>
    {!layout ? <section className="max-w-[540px] my-[65px] mx-auto bg-[#fffef9] p-9 border border-solid border-[#d9decf] rounded-xl">
      <p className={`${eyebrow} text-[#687761]`}>START A TABLE</p><h2 className="text-[27px] tracking-[-.7px] mt-1.5 mb-5">Your next battlefield</h2><p className="leading-[1.6] text-[#687761]">Choose your game and the physical size of your board.</p>
      {loadWarning && <p className="leading-[1.6] text-[#687761]" role="alert">{loadWarning}</p>}
      {formError && <p className="leading-[1.6] text-[#687761]" role="alert">{formError}</p>}
      <form onSubmit={event => {
        event.preventDefault()
        const boardWidth = Number(size === 'custom' ? width : size) / (size === 'custom' ? unitFactor(units) : 1)
        const boardHeight = Number(size === 'custom' ? height : size) / (size === 'custom' ? unitFactor(units) : 1)
        if (!(Number.isFinite(boardWidth) && boardWidth > 0 && Number.isFinite(boardHeight) && boardHeight > 0)) { setFormError('Board dimensions must be positive numbers.'); return }
        createLayout({ version: 2, tags: suppliedTags(), game, board: { width: boardWidth, height: boardHeight }, pieces: [] })
      }}>
        <label className={setupLabel}>Units<select className={`${fieldControl} w-full p-3`} value={units} onChange={event => {
          const next = event.target.value as Units
          setWidth(String(Number(width) / unitFactor(units) * unitFactor(next)))
          setHeight(String(Number(height) / unitFactor(units) * unitFactor(next)))
          setUnits(next)
        }}><option value="in">Inches</option><option value="cm">Centimetres</option></select></label>
        <label className={setupLabel}>Game<select className={`${fieldControl} w-full p-3`} value={game} onChange={event => setGame(event.target.value as Game)}><option value="firefight">Grimdark Future: Firefight</option><option value="custom">Custom game</option></select></label>
        <label className={setupLabel}>Board size<select className={`${fieldControl} w-full p-3`} value={size} onChange={event => setSize(event.target.value)}><option value="48">4′ × 4′ · 48″ × 48″</option><option value="36">3′ × 3′ · 36″ × 36″</option><option value="custom">Custom dimensions</option></select></label>
        {size === 'custom' && <div className="flex gap-4"><label className={setupLabel}>Width ({units === 'in' ? 'inches' : 'centimetres'})<input className={`${fieldControl} w-full p-3`} type="number" min="0" step="any" required value={width} onChange={event => setWidth(event.target.value)} /></label><label className={setupLabel}>Height ({units === 'in' ? 'inches' : 'centimetres'})<input className={`${fieldControl} w-full p-3`} type="number" min="0" step="any" required value={height} onChange={event => setHeight(event.target.value)} /></label></div>}
        <button className="border-0 bg-[#315e49] text-white rounded-md py-3.5 px-[22px] w-full mt-2.5" type="submit">Create layout</button>
      </form>
    </section> : <>
      <div className="grid grid-cols-[200px_minmax(0,1fr)_240px] gap-4 min-h-0 compact:grid-cols-[160px_minmax(0,1fr)_200px] compact:gap-3"><TerrainLibrary units={units} scale={scale} dragRef={terrainDragRef} /><section className="min-w-0 min-h-0 grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-2"><div ref={boardRef} className="w-full h-full min-h-0"><div className="shadow-[0_3px_20px_#344b3212] overflow-hidden" role="region" aria-label="Terrain board" style={{ width: layout.board.width * scale, height: layout.board.height * scale }} onDragOver={event => event.preventDefault()} onDrop={event => {
        event.preventDefault()
        const anchor = terrainDragRef.current
        if (event.dataTransfer.getData('text/plain') !== anchor?.template.name || !anchor) return
        const bounds = event.currentTarget.getBoundingClientRect()
        place(anchor.template, (event.clientX - bounds.left) / scale - anchor.x * anchor.template.footprint.width,
          (event.clientY - bounds.top) / scale - anchor.y * anchor.template.footprint.depth)
        clearTerrainDrag(terrainDragRef)
      }}>
        <Stage width={layout.board.width * scale} height={layout.board.height * scale} onMouseDown={event => { if (event.target === event.target.getStage()) setSelected(null) }}>
          <Layer ref={layerRef}><Rect width={layout.board.width * scale} height={layout.board.height * scale} fill="#e6e9dc" listening={false} />
            {showGrid && grid * scale >= 8 && <>
              {Array.from({ length: Math.floor(layout.board.width / grid) }, (_, index) => <Line key={`x-${index}`} points={[(index + 1) * grid * scale, 0, (index + 1) * grid * scale, layout.board.height * scale]} stroke="#cbd3c2" strokeWidth={1} listening={false} />)}
              {Array.from({ length: Math.floor(layout.board.height / grid) }, (_, index) => <Line key={`y-${index}`} points={[0, (index + 1) * grid * scale, layout.board.width * scale, (index + 1) * grid * scale]} stroke="#cbd3c2" strokeWidth={1} listening={false} />)}
            </>}
            {layout.pieces.map(piece => {
              const oval = piece.footprint.kind === 'ellipse'
              const Footprint = oval ? Ellipse : Rect
              // Ellipse is centre-based; retain the same local top-left origin as rectangles.
              return <Footprint offsetX={oval ? -piece.footprint.width * scale / 2 : 0} offsetY={oval ? -piece.footprint.depth * scale / 2 : 0} id={`piece-${piece.id}`} key={piece.id} x={piece.x * scale} y={piece.y * scale} width={piece.footprint.width * scale} height={piece.footprint.depth * scale} rotation={piece.rotation} fill={piece.colour} stroke={piece.id === selected ? '#285849' : '#63735c'} strokeWidth={piece.id === selected ? 3 : 1} draggable dragBoundFunc={position => ({ x: snap(position.x / scale) * scale, y: snap(position.y / scale) * scale })} onTransformEnd={event => {
              editPiece({ ...piece, x: event.target.x() / scale, y: event.target.y() / scale, rotation: event.target.rotation() })
            }} onMouseDown={() => setSelected(piece.id)} onDragStart={() => setSelected(piece.id)} onDragEnd={event => {
              const x = snap(event.target.x() / scale), y = snap(event.target.y() / scale)
              event.target.position({ x: x * scale, y: y * scale })
              editPiece({ ...piece, x, y })
            }} />
            })}
            {/* When Ctrl enables snap angles, always choose the nearest one. */}
            <Transformer ref={transformerRef} resizeEnabled={false} rotateEnabled rotateAnchorOffset={24} rotationSnapTolerance={180} />
          </Layer>
        </Stage>
      </div></div><p className="m-0 text-[11px] leading-[1.6] text-[#7a856f]">{measurement(layout.board.width, units)} × {measurement(layout.board.height, units)} playing area · top-down terrain footprints</p></section>
      <aside className={`grid gap-4 h-full min-h-0 self-start p-0 border-0 rounded-lg bg-transparent overflow-hidden ${selectedPiece ? 'grid-rows-[minmax(100px,1fr)_minmax(0,2fr)]' : 'grid-rows-[minmax(0,1fr)]'}`} aria-label="Terrain panels">
        <section className={panel} aria-label="Terrain pieces"><p className={`${eyebrow} text-[#75816c]`}>ON THE BOARD</p><h3 className={panelHeading}>{layout.pieces.length} terrain {layout.pieces.length === 1 ? 'piece' : 'pieces'}</h3>
        <ul className="list-none p-0 mb-0">{layout.pieces.map((piece, index) => <li key={piece.id}><button className="text-left w-full p-2 border-0 bg-transparent text-[#465c42] rounded-sm aria-pressed:bg-[#e3e9da]" aria-pressed={selected === piece.id} onClick={() => setSelected(piece.id)}>{piece.name} {index + 1}</button></li>)}</ul></section>
        {selectedPiece && <section className={panel} aria-label="Selected terrain"><p className={`${eyebrow} text-[#75816c]`}>SELECTED TERRAIN</p><h3 className={panelHeading}>{selectedPiece.name}</h3><p className={panelText}>Position: {units === 'in' ? `${selectedPiece.x.toFixed(1)}″, ${selectedPiece.y.toFixed(1)}″` : `${measurement(selectedPiece.x, units)}, ${measurement(selectedPiece.y, units)}`}</p>
          <TerrainProperties key={JSON.stringify(selectedPiece) + units} piece={selectedPiece} units={units} availableTags={layout.tags} onApply={editPiece} />
          <p className={panelText}>Drag the round handle above the selected footprint to rotate. Hold Ctrl to snap in 15° increments.</p>
        </section>}
      </aside></div>
      {settingsOpen && <LayoutSettings layout={layout} onSave={tags => { if (JSON.stringify(tags) !== JSON.stringify(layout.tags)) updateLayout({ ...layout, tags }); setSettingsOpen(false); settingsTrigger.current?.focus() }} onCancel={() => { setSettingsOpen(false); settingsTrigger.current?.focus() }} />}
    </>}
  </main>
}
export default App
