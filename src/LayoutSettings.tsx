import { useEffect, useRef, useState } from 'react'
import type { Layout, TerrainTag } from './planner'
import { fieldControl, secondaryButton } from './uiStyles'

export function LayoutSettings({ layout, onSave, onCancel }: { layout: Layout; onSave: (tags: TerrainTag[]) => void; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tags, setTags] = useState(() => structuredClone(layout.tags))
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  function addTag() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Enter a tag name.'); return }
    if (tags.some(tag => tag.name.toLowerCase() === trimmed.toLowerCase())) { setError('A tag with that name already exists.'); return }
    setTags([...tags, { id: crypto.randomUUID(), name: trimmed, blocksLos: false }])
    setName(''); setError('')
  }
  function cancel() { dialog.current?.close(); onCancel() }
  function save() { dialog.current?.close(); onSave(tags) }
  return <dialog ref={dialog} aria-labelledby="settings-title" onCancel={event => { event.preventDefault(); cancel() }} className="w-[min(90vw,520px)] max-h-[85vh] overflow-y-auto rounded-lg border border-[#cbd3c2] bg-[#fffef9] p-6 text-[#263b2c] backdrop:bg-black/40">
    <h2 id="settings-title" className="mt-0">Layout settings</h2>
    <div role="tablist" aria-label="Layout settings sections"><button type="button" role="tab" aria-selected="true" aria-controls="tags-panel" id="tags-tab" className={secondaryButton}>Tags</button></div>
    <section role="tabpanel" id="tags-panel" aria-labelledby="tags-tab">
      <p className="text-sm">A terrain piece blocks line of sight when any of its tags blocks LOS.</p>
      <ul className="list-none p-0">{tags.map(tag => <li key={tag.id} className="flex items-center gap-3 py-2 border-b border-[#e1e5db]"><span className="flex-1">{tag.name} <span className="text-xs text-[#73806b]">({layout.pieces.filter(piece => piece.tags.includes(tag.id)).length} {layout.pieces.filter(piece => piece.tags.includes(tag.id)).length === 1 ? 'piece' : 'pieces'})</span></span><label className="text-sm whitespace-nowrap"><input type="checkbox" aria-label={`${tag.name} Blocks LOS`} checked={tag.blocksLos} onChange={event => setTags(tags.map(item => item.id === tag.id ? { ...item, blocksLos: event.target.checked } : item))} /> Blocks LOS</label></li>)}</ul>
      <label className="block text-sm font-semibold">New tag<input className={`${fieldControl} w-full p-2 mt-1`} value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag() } }} /></label>
      <button className={`${secondaryButton} mt-2`} type="button" onClick={addTag}>Add tag</button>
      {error && <p role="alert">{error}</p>}
    </section>
    <div className="flex gap-2 mt-5"><button className={secondaryButton} type="button" onClick={save}>Save</button><button className={secondaryButton} type="button" onClick={cancel}>Cancel</button></div>
  </dialog>
}
