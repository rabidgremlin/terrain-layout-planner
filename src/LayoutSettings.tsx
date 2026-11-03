import { useEffect, useRef, useState } from 'react'
import type { Layout, TerrainTag } from './planner'
import { fieldControl, secondaryButton } from './uiStyles'

export function LayoutSettings({ layout, onSave, onCancel }: { layout: Layout; onSave: (tags: TerrainTag[]) => void; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tags, setTags] = useState(() => structuredClone(layout.tags))
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  function normalizedTags() {
    const normalized = tags.map(tag => ({ ...tag, name: tag.name.trim() }))
    if (normalized.some(tag => !tag.name)) { setError('Enter a name for every tag.'); return null }
    if (new Set(normalized.map(tag => tag.name.toLowerCase())).size !== normalized.length) {
      setError('Tag names must be unique, ignoring case.'); return null
    }
    return normalized
  }
  function addTag() {
    const normalized = normalizedTags()
    if (!normalized) return
    const trimmed = name.trim()
    if (!trimmed) { setError('Enter a tag name.'); return }
    if (normalized.some(tag => tag.name.toLowerCase() === trimmed.toLowerCase())) { setError('A tag with that name already exists.'); return }
    setTags([...tags, { id: crypto.randomUUID(), name: trimmed, blocksLos: false }])
    setName(''); setError('')
  }
  function cancel() { dialog.current?.close(); onCancel() }
  function deleteTag(tag: TerrainTag) {
    const count = layout.pieces.filter(piece => piece.tags.includes(tag.id)).length
    if (!window.confirm(`Delete “${tag.name}”? This affects ${count} placed ${count === 1 ? 'piece' : 'pieces'}. Save will remove their memberships and this layout's catalog associations. Future placements will no longer carry this tag. Cancel Layout settings to discard the deletion.`)) return
    setTags(tags.filter(item => item.id !== tag.id))
    setError('')
  }
  function save() {
    const normalized = normalizedTags()
    if (!normalized) return
    dialog.current?.close(); onSave(normalized)
  }
  return <dialog ref={dialog} aria-labelledby="settings-title" onCancel={event => { event.preventDefault(); cancel() }} className="w-[min(90vw,600px)] max-h-[85vh] open:flex open:flex-col overflow-hidden rounded-lg border border-[#cbd3c2] bg-[#fffef9] p-6 text-[#263b2c] backdrop:bg-black/40">
    <h2 id="settings-title" className="mt-0 shrink-0">Layout settings</h2>
    <div role="tablist" aria-label="Layout settings sections" className="shrink-0"><button type="button" role="tab" aria-selected="true" aria-controls="tags-panel" id="tags-tab" className={secondaryButton}>Tags</button></div>
    <section role="tabpanel" id="tags-panel" aria-labelledby="tags-tab" className="min-h-0 overflow-y-auto px-2 -mx-2">
      <p className="text-sm">A terrain piece blocks line of sight when any of its tags blocks LOS.</p>
      <ul className="list-none p-0">{tags.map(tag => {
        const count = layout.pieces.filter(piece => piece.tags.includes(tag.id)).length
        return <li key={tag.id} aria-label={tag.name} className="flex items-center gap-3 py-2 border-0 border-b border-solid border-[#e1e5db]">
          <input className={`${fieldControl} flex-1 min-w-0 p-2`} aria-label={`Tag name: ${tag.name}`} value={tag.name} onChange={event => { setTags(tags.map(item => item.id === tag.id ? { ...item, name: event.target.value } : item)); setError('') }} />
          <span className="text-xs text-[#73806b] whitespace-nowrap">{count} {count === 1 ? 'piece' : 'pieces'}</span>
          <label className="text-sm whitespace-nowrap"><input type="checkbox" aria-label={`${tag.name} Blocks LOS`} checked={tag.blocksLos} onChange={event => setTags(tags.map(item => item.id === tag.id ? { ...item, blocksLos: event.target.checked } : item))} /> Blocks LOS</label>
          <button type="button" className={secondaryButton} onClick={() => deleteTag(tag)}>Delete</button>
        </li>
      })}</ul>
      <label className="block text-sm font-semibold">New tag<input className={`${fieldControl} w-full p-2 mt-1`} value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag() } }} /></label>
      <button className={`${secondaryButton} mt-2`} type="button" onClick={addTag}>Add tag</button>
      {error && <p role="alert">{error}</p>}
    </section>
    <div className="flex shrink-0 gap-2 mt-5"><button className={secondaryButton} type="button" onClick={save}>Save</button><button className={secondaryButton} type="button" onClick={cancel}>Cancel</button></div>
  </dialog>
}
