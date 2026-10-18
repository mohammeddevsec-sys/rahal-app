const OVERPASS_API = 'http://localhost:3001/api/overpass'
const DEFAULT_RADIUS_M = 5000
const DEFAULT_TIMEOUT_S = 25

export const CATEGORIES = [
  { id: 'restaurant', label: '\u0645\u0637\u0627\u0639\u0645', tag: 'amenity=restaurant' },
  { id: 'cafe', label: '\u0645\u0642\u0627\u0647\u064A', tag: 'amenity=cafe' },
  { id: 'pharmacy', label: '\u0635\u064A\u062F\u0644\u064A\u0627\u062A', tag: 'amenity=pharmacy' },
  { id: 'hospital', label: '\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A', tag: 'amenity=hospital' },
  { id: 'clinic', label: '\u0639\u064A\u0627\u062F\u0627\u062A', tag: 'amenity=clinic' },
  { id: 'fuel', label: '\u0645\u062D\u0637\u0627\u062A \u0648\u0642\u0648\u062F', tag: 'amenity=fuel' },
  { id: 'market', label: '\u0623\u0633\u0648\u0627\u0642', tag: 'amenity=marketplace' },
  { id: 'supermarket', label: '\u0628\u0642\u0627\u0644\u0627\u062A', tag: 'shop=supermarket' },
  { id: 'mosque', label: '\u0645\u0633\u0627\u062C\u062F', tag: 'amenity=place_of_worship' },
  { id: 'school', label: '\u0645\u062F\u0627\u0631\u0633', tag: 'amenity=school' },
  { id: 'bank', label: '\u0645\u0635\u0627\u0631\u0641', tag: 'amenity=bank' },
  { id: 'atm', label: '\u0635\u0631\u0627\u0641\u0627\u062A', tag: 'amenity=atm' },
  { id: 'parking', label: '\u0645\u0648\u0627\u0642\u0641', tag: 'amenity=parking' },
  { id: 'hotel', label: '\u0641\u0646\u0627\u062F\u0642', tag: 'tourism=hotel' },
]

let lastRequestTime = 0
const MIN_INTERVAL_MS = 1500

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

function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null
}

function buildQuery(tag, center, radiusM) {
  const parts = tag.split('=')
  const key = parts[0]
  const value = parts[1]
  const around = 'around:' + radiusM + ',' + center.lat + ',' + center.lng
  return '[out:json][timeout:' + DEFAULT_TIMEOUT_S + '];' +
    '(' +
    'node["' + key + '"="' + value + '"](' + around + ');' +
    'way["' + key + '"="' + value + '"](' + around + ');' +
    'relation["' + key + '"="' + value + '"](' + around + ');' +
    ');out center;'
}

function extractName(tags) {
  if (!tags) return ''
  return tags['name:ar'] || tags.name || tags['name:en'] || ''
}

function parseElement(el) {
  let lat, lng
  if (el.type === 'node') { lat = el.lat; lng = el.lon }
  else if (el.center) { lat = el.center.lat; lng = el.center.lon }
  else return null
  const name = extractName(el.tags) || '\u0628\u062F\u0648\u0646 \u0627\u0633\u0645'
  const street = el.tags && el.tags['addr:street'] ? el.tags['addr:street'] : ''
  const city = el.tags && (el.tags['addr:city'] || el.tags['addr:town'] || el.tags['addr:village']) ? (el.tags['addr:city'] || el.tags['addr:town'] || el.tags['addr:village']) : ''
  const fullParts = [name, street, city].filter(Boolean)
  return {
    id: el.type + '/' + el.id,
    name: name,
    fullName: fullParts.join(', '),
    lat: lat,
    lng: lng,
    type: el.tags && el.tags.amenity ? el.tags.amenity : (el.tags && el.tags.shop ? el.tags.shop : 'poi'),
    category: el.tags ? el.tags : {},
  }
}

async function callOverpassProxy(query) {
  const res = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    throw new Error('proxy failed: ' + res.status)
  }
  const wrapper = await res.json()
  if (!wrapper || !wrapper.ok || !wrapper.data) {
    throw new Error('proxy returned invalid payload')
  }
  return wrapper.data
}

export async function searchNearby(categoryId, center, options = {}) {
  const category = getCategoryById(categoryId)
  if (!category) return []
  if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') return []

  const radius = options.radius || DEFAULT_RADIUS_M
  await waitForRateLimit()
  lastRequestTime = Date.now()

  const query = buildQuery(category.tag, center, radius)
  const data = await callOverpassProxy(query)
  const elements = data && data.elements ? data.elements : []
  const mapped = []
  for (let i = 0; i < elements.length; i++) {
    const p = parseElement(elements[i])
    if (!p) continue

    if (categoryId === 'hospital') {
      const tags = p.category || {}
      const nonHospitalPattern = /(فندق|قاعة\s*أعراس|اعراس|الرقابة المالية|دائرة صحة|مديرية|صيدلية|مختبر|مركز صحي|مركز تأهيل|مركز تاهيل|الأطراف الصناعية|البيطري|بيطري|مركز زراعة الشعر|مركززراعة الشعر|wedding|financial control|pharmacy|rehabilitation center|veterinary|hair transplant|new hair center|\blab\b|laboratory)/i
      if (!p.name || p.name === 'بدون اسم') {
        if (tags.healthcare !== 'hospital' && !tags['addr:city'] && !tags['addr:street'] && !tags['addr:postcode']) continue
        const nearbyNamedHospital = elements.some((element) => {
          const other = parseElement(element)
          if (!other || !other.name || other.name === 'بدون اسم' || other.id === p.id) return false
          const distance = distanceMeters(other, p)
          if (distance < 100) return true
          const otherTags = other.category || {}
          const otherText = [other.name, otherTags['name:en'] || '', otherTags['addr:street'] || ''].join(' ').toLowerCase()
          if (nonHospitalPattern.test(otherText)) return false
          return distance < 200
        })
        if (nearbyNamedHospital) continue
        continue
      }
      const text = [p.name, tags['name:en'] || '', tags['addr:street'] || ''].join(' ').toLowerCase()
      if (nonHospitalPattern.test(text)) continue
      const normalizedName = p.name.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()
      const duplicate = mapped.some((item) =>
        item.name.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim() === normalizedName &&
        distanceMeters(item, p) < 100
      )
      if (duplicate) continue
    }
    mapped.push(p)
  }
  mapped.forEach((r) => { r.distance = distanceMeters(r, center) })
  mapped.sort((a, b) => a.distance - b.distance)
  console.log('overpass ok via proxy results=' + mapped.length)
  return mapped
}
