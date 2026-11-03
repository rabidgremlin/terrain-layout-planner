import { Circle, Line, Text } from 'react-konva'
import { unitFactor } from './measurements'
import type { Units } from './measurements'
import type { SightLineTool } from './useSightLine'
import { secondaryButton } from './uiStyles'

export function SightLineOverlay({ tool, scale }: { tool: SightLineTool; scale: number }) {
  const { selection, cursor, result } = tool
  const colour = result?.blocked ? '#465c42' : '#285849'
  return <>
    {selection && <>
      {selection.to && <Line points={[selection.from.x * scale, selection.from.y * scale, selection.to.x * scale, selection.to.y * scale]} stroke={colour} strokeWidth={2} dash={result?.blocked ? [6, 4] : undefined} listening={false} />}
      {[selection.from, ...(selection.to ? [selection.to] : [])].map((point, index) => <Circle key={index} x={point.x * scale} y={point.y * scale} radius={4} fill="#fffef9" stroke={colour} strokeWidth={2} listening={false} />)}
      <Text x={selection.from.x * scale + 7} y={selection.from.y * scale - 14} text="A" fontSize={12} fill={colour} listening={false} />
      {selection.to && <Text x={selection.to.x * scale + 7} y={selection.to.y * scale - 14} text="B" fontSize={12} fill={colour} listening={false} />}
    </>}
    {cursor && <>
      <Line points={[cursor.x * scale - 7, cursor.y * scale, cursor.x * scale + 7, cursor.y * scale]} stroke="#b47f36" strokeWidth={1} listening={false} />
      <Line points={[cursor.x * scale, cursor.y * scale - 7, cursor.x * scale, cursor.y * scale + 7]} stroke="#b47f36" strokeWidth={1} listening={false} />
    </>}
  </>
}

export function SightLineReadout({ tool, units }: { tool: SightLineTool; units: Units }) {
  return <section aria-label="Line of sight" className="rounded-md border border-solid border-[#d9decf] bg-[#fffef9] p-3 text-[12px] text-[#465c42]">
    <div className="flex items-center justify-between gap-2"><p role="status" className="m-0 font-semibold">{tool.result
      ? `${tool.result.blocked ? 'Blocked' : 'Clear'} · Distance: ${(tool.result.distance * unitFactor(units)).toFixed(2)} ${units}`
      : tool.selection ? 'Select an ending point' : 'Select a starting point'}</p><button type="button" className={secondaryButton} onClick={tool.clear} disabled={!tool.selection}>Clear line</button></div>
    <p id="sight-line-help" className="my-1">Click two board points; a third starts another line. Arrows move the marker by 1 {units} (Shift: 0.1 {units}); Enter selects. Escape exits.</p>
    {tool.cursor && <p className="my-1" aria-live="polite">Marker: {(tool.cursor.x * unitFactor(units)).toFixed(2)}, {(tool.cursor.y * unitFactor(units)).toFixed(2)} {units}</p>}
    <p className="m-0 text-[#73806b]">Top-down 2D planning approximation. Dense is a solid blocker here, deliberately simplifying Firefight rules. Touching a blocking boundary also blocks sight.</p>
  </section>
}
