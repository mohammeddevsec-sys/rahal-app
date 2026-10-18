const STORAGE_KEY = 'rahal.searchHistory'
const MAX_ITEMS = 10

export function loadSearchHistory() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((x) => x && typeof x.name === 'string')
  } catch (err) {
    console.error('loadSearchHistory failed:', err)
    return []
  }
}

export function addSearchHistory(entry) {
  if (!entry || !entry.name) return
  if (typeof window === 'undefined') return
  try {
    const current = loadSearchHistory()
    const filtered = current.filter((x) => !(x.name === entry.name && x.lat === entry.lat && x.lng === entry.lng))
    const next = [{ name: entry.name, fullName: entry.fullName || '', lat: entry.lat, lng: entry.lng }, ...filtered].slice(0, MAX_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    console.error('addSearchHistory failed:', err)
  }
}

export function removeSearchHistory(entry) {
  if (!entry || !entry.name) return
  if (typeof window === 'undefined') return
  try {
    const current = loadSearchHistory()
    const filtered = current.filter((x) => !(x.name === entry.name && x.lat === entry.lat && x.lng === entry.lng))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (err) {
    console.error('removeSearchHistory failed:', err)
  }
}

export function clearSearchHistory() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('clearSearchHistory failed:', err)
  }
}