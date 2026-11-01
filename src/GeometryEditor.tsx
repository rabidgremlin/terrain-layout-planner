import { useState } from 'react'
import type { TerrainPiece } from './planner'

import { displayNumber, unitFactor } from './measurements'
import type { Units } from './measurements'

export function GeometryEditor({ piece, units, onApply }: { piece: TerrainPiece; units: Units; onApply: (piece: TerrainPiece) => void }) {
  const factor = unitFactor(units)
  const [values, setValues] = useState({
    width: displayNumber(piece.footprint.width * factor), height: displayNumber(piece.footprint.height * factor),
    x: displayNumber(piece.x * factor), y: displayNumber(piece.y * factor), rotation: displayNumber(piece.rotation),
  })
  const [error, setError] = useState('')
  return <form onSubmit={event => {
    event.preventDefault()
    const width = Number(values.width) / factor, height = Number(values.height) / factor
    const x = Number(values.x) / factor, y = Number(values.y) / factor, rotation = Number(values.rotation)
    if (![width, height, x, y, rotation].every(Number.isFinite) || width <= 0 || height <= 0) {
      setError('Terrain dimensions must be positive and geometry must contain finite numbers.'); return
    }
    // Preserve the original precision for fields the player has not changed.
    const physical = (key: 'width' | 'height' | 'x' | 'y', original: number) => values[key] === displayNumber(original * factor) ? original : Number(values[key]) / factor
    onApply({ ...piece, x: physical('x', piece.x), y: physical('y', piece.y), rotation,
      footprint: { ...piece.footprint, width: physical('width', piece.footprint.width), height: physical('height', piece.footprint.height) } })
    setError('')
  }}>
    <div className="geometry-fields">{([
      ['width', `Terrain width (${units})`], ['height', `Terrain height (${units})`],
      ['x', `X position (${units})`], ['y', `Y position (${units})`], ['rotation', 'Rotation (degrees)'],
    ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" step="any" required value={values[key]} onChange={event => setValues({ ...values, [key]: event.target.value })} /></label>)}</div>
    {error && <p role="alert">{error}</p>}
    <button type="submit">Apply geometry</button>
  </form>
}
