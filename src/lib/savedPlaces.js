const KEY_HOME = 'rahal.home'
const KEY_WORK = 'rahal.work'

export const HOME_KEY = KEY_HOME
export const WORK_KEY = KEY_WORK

export function loadPlace(key) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return null
    return p
  } catch (err) {
    console.error('loadPlace failed:', err)
    return null
  }
}

export function savePlace(key, place) {
  if (typeof window === 'undefined') return
  if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') return
  try {
    window.localStorage.setItem(key, JSON.stringify({
      name: place.name || '',
      fullName: place.fullName || '',
      lat: place.lat,
      lng: place.lng,
    }))
  } catch (err) {
    console.error('savePlace failed:', err)
  }
}

export function clearPlace(key) {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(key) } catch (err) { console.error('clearPlace failed:', err) }
}