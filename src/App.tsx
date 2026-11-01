import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Transformer } from 'react-konva'
import Konva from 'konva'
import { useLayoutHistory } from './history'
import { GeometryEditor } from './GeometryEditor'
import { measurement, unitFactor } from './measurements'
import type { Units } from './measurements'
import { building, loadLayout, saveLayout } from './planner'
import type { Game, TerrainPiece } from './planner'
import './App.css'

function App() {
  const [initial] = useState(loadLayout)
  const { layout, commit: updateLayout, undo, redo, canUndo, canRedo } = useLayoutHistory(initial.layout)
  const [units, setUnits] = useState<Units>('in')
  const [snapping, setSnapping] = useState(false)
  const [grid, setGrid] = useState(1)
  const transformerRef = useRef<Konva.Transformer>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const [game, setGame] = useState<Game>('firefight')
  const [size, setSize] = useState('48')
  const [width, setWidth] = useState('48')
  const [height, setHeight] = useState('48')
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState(true)
  const [formError, setFormError] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const templatePreviewRef = useRef<HTMLSpanElement>(null)
  const terrainDragRef = useRef<{ x: number; y: number; image: HTMLElement | null } | null>(null)
  const [availableSize, setAvailableSize] = useState({ width: 720, height: 720 })
  const hasLayout = layout !== null
  function clearTerrainDrag() {
    terrainDragRef.current?.image?.remove()
    terrainDragRef.current = null
  }
  useEffect(() => () => { terrainDragRef.current?.image?.remove() }, [])
  useEffect(() => {
    // Storage can fail independently of layout state; report the write result.
    // oxlint-disable-next-line react/set-state-in-effect
    if (layout) setSaved(saveLayout(layout))
  }, [layout])
  useEffect(() => {
    const node = layerRef.current?.findOne(`#piece-${selected}`)
    transformerRef.current?.nodes(node ? [node] : [])
  }, [selected, layout])
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
  function place(x: number, y: number) {
    if (!layout) return
    const piece: TerrainPiece = { ...building, footprint: { ...building.footprint }, tags: [...building.tags], id: crypto.randomUUID(), x: snap(x), y: snap(y) }
    updateLayout({ ...layout, pieces: [...layout.pieces, piece] })
    setSelected(piece.id)
  }
  return <main className={hasLayout ? 'editor' : undefined}>
    <header>
      <span className="mark" aria-hidden="true">▧</span><h1>Terrain layout planner</h1>
      {layout && <><h2 className="layout-title">{layout.game === 'firefight' ? 'Firefight' : 'Custom game'} · {measurement(layout.board.width, units)} × {measurement(layout.board.height, units)}</h2><span role="status">{saved ? 'Saved locally' : 'Could not save — browser storage is unavailable'}</span></>}
    </header>
    {!layout ? <section className="setup">
      <p className="eyebrow">START A TABLE</p><h2>Your next battlefield</h2><p>Choose your game and the physical size of your board.</p>
      {initial.warning && <p role="alert">{initial.warning}</p>}
      {formError && <p role="alert">{formError}</p>}
      <form onSubmit={event => {
        event.preventDefault()
        const boardWidth = Number(size === 'custom' ? width : size) / (size === 'custom' ? unitFactor(units) : 1)
        const boardHeight = Number(size === 'custom' ? height : size) / (size === 'custom' ? unitFactor(units) : 1)
        if (!(Number.isFinite(boardWidth) && boardWidth > 0 && Number.isFinite(boardHeight) && boardHeight > 0)) { setFormError('Board dimensions must be positive numbers.'); return }
        updateLayout({ version: 1, game, board: { width: boardWidth, height: boardHeight }, pieces: [] })
      }}>
        <label>Units<select value={units} onChange={event => {
          const next = event.target.value as Units
          setWidth(String(Number(width) / unitFactor(units) * unitFactor(next)))
          setHeight(String(Number(height) / unitFactor(units) * unitFactor(next)))
          setUnits(next)
        }}><option value="in">Inches</option><option value="cm">Centimetres</option></select></label>
        <label>Game<select value={game} onChange={event => setGame(event.target.value as Game)}><option value="firefight">Grimdark Future: Firefight</option><option value="custom">Custom game</option></select></label>
        <label>Board size<select value={size} onChange={event => setSize(event.target.value)}><option value="48">4′ × 4′ · 48″ × 48″</option><option value="36">3′ × 3′ · 36″ × 36″</option><option value="custom">Custom dimensions</option></select></label>
        {size === 'custom' && <div className="dimensions"><label>Width ({units === 'in' ? 'inches' : 'centimetres'})<input type="number" min="0" step="any" required value={width} onChange={event => setWidth(event.target.value)} /></label><label>Height ({units === 'in' ? 'inches' : 'centimetres'})<input type="number" min="0" step="any" required value={height} onChange={event => setHeight(event.target.value)} /></label></div>}
        <button className="primary" type="submit">Create layout</button>
      </form>
    </section> : <>
      <div className="workspace"><aside>
        <div className="edit-actions"><button onClick={undo} disabled={!canUndo}>Undo</button><button onClick={redo} disabled={!canRedo}>Redo</button></div>
        <label>Units<select value={units} onChange={event => setUnits(event.target.value as Units)}><option value="in">Inches</option><option value="cm">Centimetres</option></select></label>
        <label className="checkbox"><input type="checkbox" checked={snapping} onChange={event => setSnapping(event.target.checked)} />Snap to grid</label>
        <label>Grid spacing ({units})<input key={units + grid} type="number" min="0.01" step="any" defaultValue={Number((grid * unitFactor(units)).toFixed(8))} onBlur={event => {
          const value = Number(event.target.value) / unitFactor(units)
          if (Number.isFinite(value) && value >= 0.01) setGrid(value)
          else event.target.value = String(grid * unitFactor(units))
        }} /></label>
        <p className="eyebrow">TERRAIN LIBRARY</p><h3>Place your terrain</h3><p>Drag a piece onto the board. Drag it again to adjust its position.</p>
        <button className="template" draggable onPointerDown={event => {
          clearTerrainDrag()
          const bounds = templatePreviewRef.current?.getBoundingClientRect()
          const insidePreview = bounds && bounds.width > 0 && bounds.height > 0
            && event.clientX >= bounds.left && event.clientX <= bounds.right
            && event.clientY >= bounds.top && event.clientY <= bounds.bottom
          // Capture the initial grab, before the pointer moves past the native drag threshold.
          terrainDragRef.current = {
            x: insidePreview ? (event.clientX - bounds.left) / bounds.width : 0.5,
            y: insidePreview ? (event.clientY - bounds.top) / bounds.height : 0.5,
            image: null,
          }
        }} onPointerUp={clearTerrainDrag} onDragStart={event => {
          const anchor = terrainDragRef.current ?? { x: 0.5, y: 0.5, image: null }
          const image = document.createElement('div')
          const width = building.footprint.width * scale
          const height = building.footprint.height * scale
          Object.assign(image.style, {
            position: 'fixed', left: '-10000px', top: '0', pointerEvents: 'none',
            width: `${width}px`, height: `${height}px`, boxSizing: 'border-box',
            background: building.colour, border: '1px solid #63735c',
          })
          image.setAttribute('aria-hidden', 'true')
          document.body.append(image)
          terrainDragRef.current = { ...anchor, image }
          event.dataTransfer.setData('text/plain', 'building')
          event.dataTransfer.effectAllowed = 'copy'
          event.dataTransfer.setDragImage(image, anchor.x * width, anchor.y * height)
        }} onDragEnd={clearTerrainDrag}><span ref={templatePreviewRef} className="preview" style={{ background: building.colour }} />{building.name} · {measurement(building.footprint.width, units)} × {measurement(building.footprint.height, units)}</button>
        <p className="hint">{building.tags.join(' · ')}</p>
        <hr /><h3>{layout.pieces.length} terrain {layout.pieces.length === 1 ? 'piece' : 'pieces'}</h3>
        <ul className="pieces">{layout.pieces.map((piece, index) => <li key={piece.id}><button aria-pressed={selected === piece.id} onClick={() => setSelected(piece.id)}>{piece.name} {index + 1}</button></li>)}</ul>
        <section aria-label="Selected terrain">{selectedPiece ? <><h3>{selectedPiece.name}</h3><p>Position: {units === 'in' ? `${selectedPiece.x.toFixed(1)}″, ${selectedPiece.y.toFixed(1)}″` : `${measurement(selectedPiece.x, units)}, ${measurement(selectedPiece.y, units)}`}</p>
          <GeometryEditor key={JSON.stringify(selectedPiece) + units} piece={selectedPiece} units={units} onApply={editPiece} />
          <p>Drag the round handle above the selected footprint to rotate.</p>
          <div className="edit-actions"><button onClick={() => {
            const copy = structuredClone(selectedPiece)
            copy.id = crypto.randomUUID(); copy.x = snap(copy.x + grid); copy.y = snap(copy.y + grid)
            updateLayout({ ...layout, pieces: [...layout.pieces, copy] }); setSelected(copy.id)
          }}>Duplicate terrain</button><button onClick={() => updateLayout({ ...layout, pieces: layout.pieces.filter(piece => piece.id !== selectedPiece.id) })}>Remove terrain</button></div></> : <p>Select a terrain piece to inspect it.</p>}</section>
      </aside><section className="board-area"><div ref={boardRef} className="board-holder"><div role="region" aria-label="Terrain board" style={{ width: layout.board.width * scale, height: layout.board.height * scale }} onDragOver={event => event.preventDefault()} onDrop={event => {
        event.preventDefault()
        const anchor = terrainDragRef.current
        if (event.dataTransfer.getData('text/plain') !== 'building' || !anchor) return
        const bounds = event.currentTarget.getBoundingClientRect()
        place((event.clientX - bounds.left) / scale - anchor.x * building.footprint.width,
          (event.clientY - bounds.top) / scale - anchor.y * building.footprint.height)
        clearTerrainDrag()
      }}>
        <Stage width={layout.board.width * scale} height={layout.board.height * scale} onMouseDown={event => { if (event.target === event.target.getStage()) setSelected(null) }}>
          <Layer ref={layerRef}><Rect width={layout.board.width * scale} height={layout.board.height * scale} fill="#e6e9dc" listening={false} />
            {snapping && grid * scale >= 8 && <>
              {Array.from({ length: Math.floor(layout.board.width / grid) }, (_, index) => <Line key={`x-${index}`} points={[(index + 1) * grid * scale, 0, (index + 1) * grid * scale, layout.board.height * scale]} stroke="#cbd3c2" strokeWidth={1} listening={false} />)}
              {Array.from({ length: Math.floor(layout.board.height / grid) }, (_, index) => <Line key={`y-${index}`} points={[0, (index + 1) * grid * scale, layout.board.width * scale, (index + 1) * grid * scale]} stroke="#cbd3c2" strokeWidth={1} listening={false} />)}
            </>}
            {layout.pieces.map(piece => <Rect id={`piece-${piece.id}`} key={piece.id} x={piece.x * scale} y={piece.y * scale} width={piece.footprint.width * scale} height={piece.footprint.height * scale} rotation={piece.rotation} fill={piece.colour} stroke={piece.id === selected ? '#285849' : '#63735c'} strokeWidth={piece.id === selected ? 3 : 1} draggable dragBoundFunc={position => ({ x: snap(position.x / scale) * scale, y: snap(position.y / scale) * scale })} onTransformEnd={event => {
              editPiece({ ...piece, x: event.target.x() / scale, y: event.target.y() / scale, rotation: event.target.rotation() })
            }} onMouseDown={() => setSelected(piece.id)} onDragStart={() => setSelected(piece.id)} onDragEnd={event => {
              const x = snap(event.target.x() / scale), y = snap(event.target.y() / scale)
              event.target.position({ x: x * scale, y: y * scale })
              editPiece({ ...piece, x, y })
            }} />)}
            <Transformer ref={transformerRef} resizeEnabled={false} rotateEnabled rotateAnchorOffset={24} />
          </Layer>
        </Stage>
      </div></div><p className="board-caption">{measurement(layout.board.width, units)} × {measurement(layout.board.height, units)} playing area · top-down terrain footprints</p></section></div>
    </>}
  </main>
}
export default App
