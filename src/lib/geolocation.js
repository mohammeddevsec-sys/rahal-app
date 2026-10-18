export const GEO_STATUS = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  GRANTED: 'granted',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  TIMEOUT: 'timeout',
  UNSUPPORTED: 'unsupported',
  ERROR: 'error',
}

export const GEO_ERROR = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
}

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 30000,
}

export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({ status: GEO_STATUS.UNSUPPORTED, code: 0, message: 'Geolocation API not available' })
      return
    }
    const opts = { ...DEFAULT_OPTIONS, ...options }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(normalizePosition(pos)),
      (err) => reject(normalizeError(err)),
      opts
    )
  })
}

export function watchPosition(onUpdate, onError, options = {}) {
  if (!isGeolocationSupported()) {
    if (onError) onError({ status: GEO_STATUS.UNSUPPORTED, code: 0, message: 'Geolocation API not available' })
    return () => {}
  }
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const id = navigator.geolocation.watchPosition(
    (pos) => { if (onUpdate) onUpdate(normalizePosition(pos)) },
    (err) => { if (onError) onError(normalizeError(err)) },
    opts
  )
  return () => navigator.geolocation.clearWatch(id)
}

export function normalizePosition(pos) {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude,
    altitudeAccuracy: pos.coords.altitudeAccuracy,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    timestamp: pos.timestamp,
  }
}

export function normalizeError(err) {
  let status = GEO_STATUS.ERROR
  if (err.code === GEO_ERROR.PERMISSION_DENIED) status = GEO_STATUS.DENIED
  else if (err.code === GEO_ERROR.POSITION_UNAVAILABLE) status = GEO_STATUS.UNAVAILABLE
  else if (err.code === GEO_ERROR.TIMEOUT) status = GEO_STATUS.TIMEOUT
  return { status, code: err.code, message: err.message || '' }
}