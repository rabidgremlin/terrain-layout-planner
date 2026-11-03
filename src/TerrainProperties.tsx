import { useState } from 'react'
import { fieldControl, secondaryButton } from './uiStyles'
import type { TerrainPiece, TerrainTag } from './planner'

import { displayNumber, unitFactor } from './measurements'
import type { Units } from './measurements'

export function TerrainProperties({ piece, units, availableTags, onApply }: { piece: TerrainPiece; units: Units; availableTags: TerrainTag[]; onApply: (piece: TerrainPiece) => void }) {
  const factor = unitFactor(units)
  const [values, setValues] = useState({
    width: displayNumber(piece.footprint.width * factor), depth: displayNumber(piece.footprint.depth * factor),
    x: displayNumber(piece.x * factor), y: displayNumber(piece.y * factor), rotation: displayNumber(piece.rotation),
  })
  const [colour, setColour] = useState(piece.colour)
  const [tags, setTags] = useState([...piece.tags])
  const [error, setError] = useState('')
  return <form onSubmit={event => {
    event.preventDefault()
    const width = Number(values.width) / factor, depth = Number(values.depth) / factor
    const x = Number(values.x) / factor, y = Number(values.y) / factor, rotation = Number(values.rotation)
    if (![width, depth, x, y, rotation].every(Number.isFinite) || width <= 0 || depth <= 0) {
      setError('Terrain dimensions must be positive and geometry must contain finite numbers.'); return
    }
    // Preserve the original precision for fields the player has not changed.
    const physical = (key: 'width' | 'depth' | 'x' | 'y', original: number) => values[key] === displayNumber(original * factor) ? original : Number(values[key]) / factor
    onApply({ ...piece, colour, tags, x: physical('x', piece.x), y: physical('y', piece.y), rotation,
      footprint: { ...piece.footprint, width: physical('width', piece.footprint.width), depth: physical('depth', piece.footprint.depth) } })
    setError('')
  }}>
    <div className="grid grid-cols-2 gap-x-2">{([
      ['width', `Terrain width (${units})`], ['depth', `Terrain depth (${units})`],
      ['x', `X position (${units})`], ['y', `Y position (${units})`], ['rotation', 'Rotation (degrees)'],
    ] as const).map(([key, label]) => <label className="grid gap-1 my-3 text-[13px] font-semibold" key={key}>{label}<input className={`${fieldControl} w-full min-w-0 p-[7px]`} type="number" step="any" required value={values[key]} onChange={event => setValues({ ...values, [key]: event.target.value })} /></label>)}</div>
    <label className="grid gap-1 my-3 text-[13px] font-semibold">Colour<input className={`${fieldControl} w-full h-9 p-1`} type="color" value={colour} onChange={event => setColour(event.target.value)} /></label>
    <p className="text-[12px]">Blocks LOS: {availableTags.some(tag => tags.includes(tag.id) && tag.blocksLos) ? 'Yes' : 'No'}</p>
    <fieldset className="m-0 p-2 border border-solid border-[#cbd3c2] rounded-md">
      <legend className="text-[13px] font-semibold">Tags</legend>
      {availableTags.map(tag => <label key={tag.id} className="flex items-center gap-2 my-2 text-[12px]"><input type="checkbox" checked={tags.includes(tag.id)} onChange={event => setTags(event.target.checked ? [...tags, tag.id] : tags.filter(value => value !== tag.id))} />{tag.name}</label>)}
    </fieldset>
    {error && <p className="text-[12px] leading-[1.6] text-[#73806b]" role="alert">{error}</p>}
    <div className="mt-3"><button className={secondaryButton} type="submit">Apply</button></div>
  </form>
}
