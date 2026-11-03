// Numerical geometry uses physical inches, independent of rendering or tag rules.
export type Point = { x: number; y: number }
export type Footprint = { kind: 'rectangle' | 'ellipse'; width: number; depth: number }
  | { kind: 'polygon'; width: number; depth: number; vertices: readonly Point[] }

type PlacedFootprint = { footprint: Footprint; x: number; y: number; rotation: number }
const epsilon = 1e-9

function localPoint(point: Point, piece: PlacedFootprint): Point {
  const angle = (piece.rotation % 360) * Math.PI / 180
  const x = point.x - piece.x, y = point.y - piece.y
  return { x: x * Math.cos(angle) + y * Math.sin(angle), y: -x * Math.sin(angle) + y * Math.cos(angle) }
}

function cross(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

function onSegment(point: Point, a: Point, b: Point): boolean {
  const length = Math.hypot(b.x - a.x, b.y - a.y)
  if (length === 0) return Math.hypot(point.x - a.x, point.y - a.y) <= epsilon
  return Math.abs(cross(a, b, point)) <= epsilon * length
    && point.x >= Math.min(a.x, b.x) - epsilon && point.x <= Math.max(a.x, b.x) + epsilon
    && point.y >= Math.min(a.y, b.y) - epsilon && point.y <= Math.max(a.y, b.y) + epsilon
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  if (onSegment(a, c, d) || onSegment(b, c, d) || onSegment(c, a, b) || onSegment(d, a, b)) return true
  return Math.sign(cross(a, b, c)) !== Math.sign(cross(a, b, d)) && Math.sign(cross(c, d, a)) !== Math.sign(cross(c, d, b))
}

function validPolygon(vertices: readonly Point[]): boolean {
  if (vertices.length < 3 || vertices.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1)) return false
  let twiceArea = 0
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i], b = vertices[(i + 1) % vertices.length], c = vertices[(i + 2) % vertices.length]
    if (Math.hypot(a.x - b.x, a.y - b.y) <= epsilon || onSegment(a, b, c) || onSegment(c, a, b)) return false
    twiceArea += a.x * b.y - b.x * a.y
    for (let j = i + 2; j < vertices.length; j++) {
      if (i === 0 && j === vertices.length - 1) continue
      if (segmentsIntersect(a, b, vertices[j], vertices[(j + 1) % vertices.length])) return false
    }
  }
  return twiceArea !== 0
}

function inPolygon(point: Point, vertices: readonly Point[]): boolean {
  let inside = false
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i], b = vertices[(i + 1) % vertices.length]
    if (onSegment(point, a, b)) return true
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

export function segmentIntersectsFootprint(from: Point, to: Point, piece: PlacedFootprint): boolean {
  if (![piece.x, piece.y, piece.rotation, piece.footprint.width, piece.footprint.depth].every(Number.isFinite) || piece.footprint.width <= 0 || piece.footprint.depth <= 0) {
    throw new RangeError('Footprints need finite transforms and positive, finite width and depth.')
  }
  const a = localPoint(from, piece), b = localPoint(to, piece)
  if (piece.footprint.kind === 'polygon') {
    if (!validPolygon(piece.footprint.vertices)) throw new RangeError('Polygon footprints must be simple, non-degenerate rings of distinct vertices in the normalized 0..1 frame, without a repeated closing vertex.')
    const vertices = piece.footprint.vertices.map(point => ({ x: point.x * piece.footprint.width, y: point.y * piece.footprint.depth }))
    return inPolygon(a, vertices) || inPolygon(b, vertices) || vertices.some((point, index) => segmentsIntersect(a, b, point, vertices[(index + 1) % vertices.length]))
  }
  if (piece.footprint.kind === 'ellipse') {
    // Scale the oval to a unit circle and find the segment point nearest its centre.
    const x = 2 * a.x / piece.footprint.width - 1, y = 2 * a.y / piece.footprint.depth - 1
    const dx = 2 * (b.x - a.x) / piece.footprint.width, dy = 2 * (b.y - a.y) / piece.footprint.depth
    const squaredLength = dx * dx + dy * dy
    const t = squaredLength === 0 ? 0 : Math.max(0, Math.min(1, -(x * dx + y * dy) / squaredLength))
    return (x + t * dx) ** 2 + (y + t * dy) ** 2 <= 1 + epsilon
  }
  let first = 0, last = 1
  for (const [start, delta, size] of [[a.x, b.x - a.x, piece.footprint.width], [a.y, b.y - a.y, piece.footprint.depth]]) {
    if (Math.abs(delta) <= epsilon) {
      if (start < -epsilon || start > size + epsilon) return false
    } else {
      const entry = (-epsilon - start) / delta, exit = (size + epsilon - start) / delta
      first = Math.max(first, Math.min(entry, exit))
      last = Math.min(last, Math.max(entry, exit))
      if (first > last) return false
    }
  }
  return true
}
