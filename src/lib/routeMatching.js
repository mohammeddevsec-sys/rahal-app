const METERS_PER_DEGREE = 111320
const DEGREES_TO_RADIANS = Math.PI / 180

function validCoordinate(value) {
  return Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    Math.abs(value[1]) <= 90
}

function bearingBetween(a, b) {
  const lat1 = a[1] * DEGREES_TO_RADIANS
  const lat2 = b[1] * DEGREES_TO_RADIANS
  const dLng = (b[0] - a[0]) * DEGREES_TO_RADIANS
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) / DEGREES_TO_RADIANS + 360) % 360
}

export function matchPositionToRoute(point, coordinates, previousSegmentIndex = 0, accuracy = 0) {
  if (!validCoordinate(point) || !Array.isArray(coordinates) || coordinates.length < 2) {
    return null
  }

  const lastSegment = coordinates.length - 2
  const previous = Number.isFinite(previousSegmentIndex)
    ? Math.max(0, Math.min(lastSegment, Math.floor(previousSegmentIndex)))
    : 0
  const startIndex = previous
  const endIndex = Math.min(lastSegment, startIndex + 160)

  const metersPerDegreeLng = METERS_PER_DEGREE *
    Math.max(0.01, Math.cos(point[1] * DEGREES_TO_RADIANS))

  let best = null

  for (let i = startIndex; i <= endIndex; i++) {
    const a = coordinates[i]
    const b = coordinates[i + 1]
    if (!validCoordinate(a) || !validCoordinate(b)) continue

    const ax = (a[0] - point[0]) * metersPerDegreeLng
    const ay = (a[1] - point[1]) * METERS_PER_DEGREE
    const bx = (b[0] - point[0]) * metersPerDegreeLng
    const by = (b[1] - point[1]) * METERS_PER_DEGREE
    const dx = bx - ax
    const dy = by - ay
    const lengthSquared = dx * dx + dy * dy

    let t = 0
    if (lengthSquared > 0) {
      t = -(ax * dx + ay * dy) / lengthSquared
      t = Math.max(0, Math.min(1, t))
    }

    const projectedX = ax + t * dx
    const projectedY = ay + t * dy
    const distanceMeters = Math.hypot(projectedX, projectedY)

    if (!best || distanceMeters < best.distanceMeters) {
      best = {
        coordinate: [
          point[0] + projectedX / metersPerDegreeLng,
          point[1] + projectedY / METERS_PER_DEGREE,
        ],
        segmentIndex: i,
        distanceMeters,
        bearing: bearingBetween(a, b),
      }
    }
  }

  const reportedAccuracy = Number.isFinite(accuracy) && accuracy > 0 ? accuracy : 35
  const maximumSnapDistance = Math.max(25, Math.min(55, reportedAccuracy * 0.8))

  if (!best || best.distanceMeters > maximumSnapDistance) return null
  return best
}