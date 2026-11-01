import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import { building, loadLayout, saveLayout } from './planner'
import type { Game, Layout, TerrainPiece } from './planner'
import './App.css'

function App() {
  const [initial] = useState(loadLayout)
  const [layout, setLayout] = useState<Layout | null>(initial.layout)
  const [game, setGame] = useState<Game>('firefight')
  const [size, setSize] = useState('48')
  const [width, setWidth] = useState('48')
  const [height, setHeight] = useState('48')
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState(true)
  const [formError, setFormError] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = useState(720)
  const hasLayout = layout !== null
  function updateLayout(next: Layout) {
    setLayout(next)
    setSaved(saveLayout(next))
  }
  useEffect(() => {
    if (!hasLayout || !boardRef.current) return
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width))
    observer.observe(boardRef.current)
    return () => observer.disconnect()
  }, [hasLayout])
  const scale = layout ? Math.min(availableWidth / layout.board.width, 720 / layout.board.height) : 1
  const selectedPiece = layout?.pieces.find(piece => piece.id === selected)
  function place(x: number, y: number) {
    if (!layout) return
    const piece: TerrainPiece = { ...building, footprint: { ...building.footprint }, tags: [...building.tags], id: crypto.randomUUID(), x, y }
    updateLayout({ ...layout, pieces: [...layout.pieces, piece] })
    setSelected(piece.id)
  }
  return <main>
    <header><span className="mark">▧</span><div><h1>Terrain layout planner</h1><p>Plan the table. Shape the battle.</p></div><span className="local">LOCAL WORKSPACE</span></header>
    {!layout ? <section className="setup">
      <p className="eyebrow">START A TABLE</p><h2>Your next battlefield</h2><p>Choose your game and the physical size of your board.</p>
      {initial.warning && <p role="alert">{initial.warning}</p>}
      {formError && <p role="alert">{formError}</p>}
      <form onSubmit={event => {
        event.preventDefault()
        const boardWidth = Number(size === 'custom' ? width : size)
        const boardHeight = Number(size === 'custom' ? height : size)
        if (!(Number.isFinite(boardWidth) && boardWidth > 0 && Number.isFinite(boardHeight) && boardHeight > 0)) { setFormError('Board dimensions must be positive numbers.'); return }
        updateLayout({ version: 1, game, board: { width: boardWidth, height: boardHeight }, pieces: [] })
      }}>
        <label>Game<select value={game} onChange={event => setGame(event.target.value as Game)}><option value="firefight">Grimdark Future: Firefight</option><option value="custom">Custom game</option></select></label>
        <label>Board size<select value={size} onChange={event => setSize(event.target.value)}><option value="48">4′ × 4′ · 48″ × 48″</option><option value="36">3′ × 3′ · 36″ × 36″</option><option value="custom">Custom dimensions</option></select></label>
        {size === 'custom' && <div className="dimensions"><label>Width (inches)<input type="number" min="0" step="any" required value={width} onChange={event => setWidth(event.target.value)} /></label><label>Height (inches)<input type="number" min="0" step="any" required value={height} onChange={event => setHeight(event.target.value)} /></label></div>}
        <button className="primary" type="submit">Create layout</button>
      </form>
    </section> : <>
      <div className="toolbar"><div><p className="eyebrow">CURRENT LAYOUT</p><h2>{layout.game === 'firefight' ? 'Firefight' : 'Custom game'} · {layout.board.width}″ × {layout.board.height}″</h2></div><span role="status">{saved ? 'Saved locally' : 'Could not save — browser storage is unavailable'}</span></div>
      <div className="workspace"><aside><p className="eyebrow">TERRAIN LIBRARY</p><h3>Place your terrain</h3><p>Drag a piece onto the board. Drag it again to adjust its position.</p>
        <button className="template" draggable onDragStart={event => { event.dataTransfer.setData('text/plain', 'building'); event.dataTransfer.effectAllowed = 'copy' }}><span className="preview" style={{ background: building.colour }} />{building.name} · {building.footprint.width}″ × {building.footprint.height}″</button>
        <p className="hint">{building.tags.join(' · ')}</p>
        <hr /><h3>{layout.pieces.length} terrain {layout.pieces.length === 1 ? 'piece' : 'pieces'}</h3>
        <ul className="pieces">{layout.pieces.map((piece, index) => <li key={piece.id}><button aria-pressed={selected === piece.id} onClick={() => setSelected(piece.id)}>{piece.name} {index + 1}</button></li>)}</ul>
        <section aria-label="Selected terrain">{selectedPiece ? <><h3>{selectedPiece.name}</h3><p>Position: {selectedPiece.x.toFixed(1)}″, {selectedPiece.y.toFixed(1)}″</p><p>{selectedPiece.footprint.width}″ × {selectedPiece.footprint.height}″</p></> : <p>Select a terrain piece to inspect it.</p>}</section>
      </aside><section className="board-area"><div ref={boardRef} className="board-holder"><div role="region" aria-label="Terrain board" style={{ width: layout.board.width * scale, height: layout.board.height * scale }} onDragOver={event => event.preventDefault()} onDrop={event => {
        event.preventDefault()
        if (event.dataTransfer.getData('text/plain') !== 'building') return
        const bounds = event.currentTarget.getBoundingClientRect()
        place((event.clientX - bounds.left) / scale, (event.clientY - bounds.top) / scale)
      }}>
        <Stage width={layout.board.width * scale} height={layout.board.height * scale} onMouseDown={event => { if (event.target === event.target.getStage()) setSelected(null) }}>
          <Layer><Rect width={layout.board.width * scale} height={layout.board.height * scale} fill="#e6e9dc" listening={false} />
            {layout.pieces.map(piece => <Rect key={piece.id} x={piece.x * scale} y={piece.y * scale} width={piece.footprint.width * scale} height={piece.footprint.height * scale} rotation={piece.rotation} fill={piece.colour} stroke={piece.id === selected ? '#285849' : '#63735c'} strokeWidth={piece.id === selected ? 3 : 1} draggable onMouseDown={() => setSelected(piece.id)} onDragStart={() => setSelected(piece.id)} onDragEnd={event => {
              const x = event.target.x() / scale, y = event.target.y() / scale
              updateLayout({ ...layout, pieces: layout.pieces.map(item => item.id === piece.id ? { ...item, x, y } : item) })
            }} />)}
          </Layer>
        </Stage>
      </div></div><p className="board-caption">{layout.board.width}″ × {layout.board.height}″ playing area · top-down terrain footprints</p></section></div>
    </>}
  </main>
}
export default App
