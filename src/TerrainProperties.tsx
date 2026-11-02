import { useState } from 'react'
import { fieldControl, secondaryButton } from './uiStyles'
import type { TerrainPiece } from './planner'

import { displayNumber, unitFactor } from './measurements'
import type { Units } from './measurements'

export function TerrainProperties({ piece, units, availableTags, onApply }: { piece: TerrainPiece; units: Units; availableTags: string[]; onApply: (piece: TerrainPiece) => void }) {
  const factor = unitFactor(units)
  const [values, setValues] = useState({
    width: displayNumber(piece.footprint.width * factor), depth: displayNumber(piece.footprint.depth * factor),
    x: displayNumber(piece.x * factor), y: displayNumber(piece.y * factor), rotation: displayNumber(piece.rotation),
  })
  const [colour, setColour] = useState(piece.colour)
  const [visibility, setVisibility] = useState(piece.visibility)
  const [tags, setTags] = useState([...piece.tags])
  const [addedTags, setAddedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [error, setError] = useState('')
  const tagOptions = [...new Set([...availableTags, ...piece.tags, ...addedTags])]
  function addTag() {
    const name = newTag.trim()
    if (!name) { setError('Enter a tag name.'); return }
    const tag = tagOptions.find(option => option.toLowerCase() === name.toLowerCase()) ?? name
    if (!tagOptions.includes(tag)) setAddedTags([...addedTags, tag])
    if (!tags.includes(tag)) setTags([...tags, tag])
    setNewTag('')
    setError('')
  }
  return <form onSubmit={event => {
    event.preventDefault()
    const width = Number(values.width) / factor, depth = Number(values.depth) / factor
    const x = Number(values.x) / factor, y = Number(values.y) / factor, rotation = Number(values.rotation)
    if (![width, depth, x, y, rotation].every(Number.isFinite) || width <= 0 || depth <= 0) {
      setError('Terrain dimensions must be positive and geometry must contain finite numbers.'); return
    }
    // Preserve the original precision for fields the player has not changed.
    const physical = (key: 'width' | 'depth' | 'x' | 'y', original: number) => values[key] === displayNumber(original * factor) ? original : Number(values[key]) / factor
    onApply({ ...piece, colour, visibility, tags, x: physical('x', piece.x), y: physical('y', piece.y), rotation,
      footprint: { ...piece.footprint, width: physical('width', piece.footprint.width), depth: physical('depth', piece.footprint.depth) } })
    setError('')
  }}>
    <div className="grid grid-cols-2 gap-x-2">{([
      ['width', `Terrain width (${units})`], ['depth', `Terrain depth (${units})`],
      ['x', `X position (${units})`], ['y', `Y position (${units})`], ['rotation', 'Rotation (degrees)'],
    ] as const).map(([key, label]) => <label className="grid gap-1 my-3 text-[13px] font-semibold" key={key}>{label}<input className={`${fieldControl} w-full min-w-0 p-[7px]`} type="number" step="any" required value={values[key]} onChange={event => setValues({ ...values, [key]: event.target.value })} /></label>)}</div>
    <label className="grid gap-1 my-3 text-[13px] font-semibold">Colour<input className={`${fieldControl} w-full h-9 p-1`} type="color" value={colour} onChange={event => setColour(event.target.value)} /></label>
    <label className="grid gap-1 my-3 text-[13px] font-semibold">Visibility behaviour<select className={`${fieldControl} w-full p-[7px]`} value={visibility} onChange={event => setVisibility(event.target.value as TerrainPiece['visibility'])}>
      <option value="clear">Clear</option><option value="blocking">Blocking</option><option value="dense">Dense</option>
    </select></label>
    <p className="text-[12px] leading-[1.6] text-[#73806b]">2D visibility: clear permits sight; blocking stops sight; dense permits sight into or out of terrain, but not through it. Tags and colour do not change this setting.</p>
    <fieldset className="m-0 p-2 border border-solid border-[#cbd3c2] rounded-md">
      <legend className="text-[13px] font-semibold">Tags</legend>
      {tagOptions.map(tag => <label key={tag} className="flex items-center gap-2 my-2 text-[12px]"><input type="checkbox" className="m-0 shrink-0" checked={tags.includes(tag)} onChange={event => setTags(event.target.checked ? [...tags, tag] : tags.filter(value => value !== tag))} /><span className="min-w-0 break-words">{tag}</span></label>)}
    </fieldset>
    <label className="grid gap-1 my-3 text-[13px] font-semibold">New tag<input className={`${fieldControl} w-full min-w-0 p-[7px]`} value={newTag} onChange={event => setNewTag(event.target.value)} onKeyDown={event => {
      if (event.key === 'Enter') { event.preventDefault(); addTag() }
    }} /></label>
    <button className={secondaryButton} type="button" onClick={addTag}>Add tag</button>
    {error && <p className="text-[12px] leading-[1.6] text-[#73806b]" role="alert">{error}</p>}
    <div className="mt-3"><button className={secondaryButton} type="submit">Apply</button></div>
  </form>
}
