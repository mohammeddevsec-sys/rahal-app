const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const DEFAULT_LIMIT = 30
const DEFAULT_LANG = 'ar,en'
const MIN_QUERY_LENGTH = 3
const DEFAULT_COUNTRY = 'iq'
const DEFAULT_RADIUS_DEG = 2.0
const NEARBY_RADIUS_DEG = 1.0

let lastRequestTime = 0
const MIN_INTERVAL_MS = 1100

function waitForRateLimit() {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_INTERVAL_MS) {
    return new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed))
  }
  return Promise.resolve()
}

function distanceMeters(a, b) {
  const dLat = (a.lat - b.lat) * 111320
  const dLng = (a.lng - b.lng) * 111320 * Math.cos((b.lat * Math.PI) / 180)
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

function buildViewbox(center, radiusDeg) {
  if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') return null
  const r = radiusDeg
  return (center.lng - r) + ',' + (center.lat - r) + ',' + (center.lng + r) + ',' + (center.lat + r)
}

function mapResults(data) {
  return (data || []).map((item) => ({
    id: String(item.place_id),
    name: item.name || item.display_name.split(',')[0],
    fullName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: item.type,
    category: item.category,
  }))
}

function sortByDistance(items, center) {
  if (!center || typeof center.lat !== 'number') return items
  items.forEach((r) => { r.distance = distanceMeters(r, center) })
  items.sort((a, b) => a.distance - b.distance)
  return items
}

async function requestOnce(query, options, viewbox, bounded) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(options.limit || DEFAULT_LIMIT),
    'accept-language': options.lang || DEFAULT_LANG,
    countrycodes: options.country || DEFAULT_COUNTRY,
  })
  if (viewbox) {
    params.set('viewbox', viewbox)
    if (bounded) params.set('bounded', '1')
  }
  const res = await fetch(NOMINATIM_URL + '?' + params.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('nominatim failed: ' + res.status)
  return res.json()
}

export async function searchPlaces(query, options = {}) {
  const trimmed = String(query || '').trim()
  if (trimmed.length < MIN_QUERY_LENGTH) return []

  const center = options.center
  if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
    await waitForRateLimit()
    lastRequestTime = Date.now()
    const data = await requestOnce(trimmed, options, null, false)
    return mapResults(data)
  }

  const nearRadius = options.nearRadius || 1.0
  const nearViewbox = buildViewbox(center, nearRadius)

  await waitForRateLimit()
  lastRequestTime = Date.now()
  let data = await requestOnce(trimmed, options, nearViewbox, true)

  if (!data || data.length === 0) {
    await waitForRateLimit()
    lastRequestTime = Date.now()
    const wideRadius = options.radius || DEFAULT_RADIUS_DEG
    const wideViewbox = buildViewbox(center, wideRadius)
    data = await requestOnce(trimmed, options, wideViewbox, false)
  }

  const mapped = mapResults(data)
  return sortByDistance(mapped, center)
}

export async function searchNearby(query, options = {}) {
  const trimmed = String(query || '').trim()
  if (trimmed.length < MIN_QUERY_LENGTH) return []

  const center = options.center
  if (!center) return []

  const radii = [NEARBY_RADIUS_DEG, 2.0, 3.5]

  for (let i = 0; i < radii.length; i++) {
    await waitForRateLimit()
    lastRequestTime = Date.now()
    const viewbox = buildViewbox(center, radii[i])
    const data = await requestOnce(trimmed, options, viewbox, true)
    if (data && data.length > 0) {
      const mapped = mapResults(data)
      return sortByDistance(mapped, center)
    }
  }
  return []
}
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const addr = data.address || {};
    return addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || data.display_name || '';
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
    return '';
  }
}
