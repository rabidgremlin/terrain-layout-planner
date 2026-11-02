import { useEffect, useRef } from 'react'
import { measurement } from './measurements'
import type { Units } from './measurements'
import type { TerrainTemplate } from './planner'
import { terrainCatalog } from './terrainCatalog'
import { clearTerrainDrag } from './terrainDrag'
import type { TerrainDragRef } from './terrainDrag'

function TemplateCard({ template, units, scale, dragRef }: { template: TerrainTemplate; units: Units; scale: number; dragRef: TerrainDragRef }) {
  const previewRef = useRef<HTMLSpanElement>(null)
  const oval = template.footprint.kind === 'ellipse'
  const previewScale = 48 / Math.max(template.footprint.width, template.footprint.height)
  return <div>
    <button className="bg-[#f2f3eb] border border-solid border-[#c7d0bc] rounded-md py-4 px-2.5 w-full grid gap-3 justify-items-center text-[12px] text-[#354b38] cursor-grab" draggable onPointerDown={event => {
      clearTerrainDrag(dragRef)
      const bounds = previewRef.current?.getBoundingClientRect()
      const insidePreview = bounds && bounds.width > 0 && bounds.height > 0
        && event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      // Capture the grab before the pointer crosses the native drag threshold.
      dragRef.current = {
        template,
        x: insidePreview ? (event.clientX - bounds.left) / bounds.width : 0.5,
        y: insidePreview ? (event.clientY - bounds.top) / bounds.height : 0.5,
        image: null,
      }
    }} onPointerUp={() => clearTerrainDrag(dragRef)} onDragStart={event => {
      const anchor = dragRef.current ?? { template, x: 0.5, y: 0.5, image: null }
      const image = document.createElement('div')
      image.className = `fixed left-[-10000px] top-0 pointer-events-none box-border border border-solid border-[#63735c] ${oval ? 'rounded-[50%]' : ''}`
      const width = template.footprint.width * scale
      const height = template.footprint.height * scale
      Object.assign(image.style, { width: `${width}px`, height: `${height}px`, background: template.colour })
      image.setAttribute('aria-hidden', 'true')
      document.body.append(image)
      dragRef.current = { ...anchor, image }
      event.dataTransfer.setData('text/plain', template.name)
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setDragImage(image, anchor.x * width, anchor.y * height)
    }} onDragEnd={() => clearTerrainDrag(dragRef)}><span ref={previewRef} aria-label={`${template.name} footprint preview`} className={`border border-solid border-[#63735c] ${oval ? 'rounded-[50%]' : 'w-[76px] h-12 rounded-[2px]'}`} style={{ background: template.colour, width: oval ? template.footprint.width * previewScale : undefined, height: oval ? template.footprint.height * previewScale : undefined }} />{template.name} · {measurement(template.footprint.width, units)} × {measurement(template.footprint.height, units)}</button>
    <p className="text-[10px] leading-[1.6] text-[#73806b]">{template.tags.join(' · ')}</p>
  </div>
}

export function TerrainLibrary({ units, scale, dragRef }: { units: Units; scale: number; dragRef: TerrainDragRef }) {
  useEffect(() => () => clearTerrainDrag(dragRef), [dragRef])
  return <aside className="bg-[#fffef9] border border-solid border-[#d9decf] rounded-lg p-5 self-start max-h-full overflow-y-auto" aria-label="Terrain library">
    <p className="m-0 text-[10px] leading-[1.6] tracking-[2px] font-bold text-[#75816c]">TERRAIN LIBRARY</p><h3 className="text-[15px]">Place your terrain</h3><p className="text-[12px] leading-[1.6] text-[#73806b]">Drag a piece onto the board. Drag it again to adjust its position.</p>
    {terrainCatalog.map(template => <TemplateCard key={template.name} template={template} units={units} scale={scale} dragRef={dragRef} />)}
  </aside>
}
