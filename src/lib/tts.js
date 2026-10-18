const TTS_API = 'http://localhost:3001/api/tts'
const RANA_VOICE = 'ar-IQ-RanaNeural'
const CACHE_LIMIT = 32
const IDB_NAME = 'rahal-tts'
const IDB_STORE = 'phrases'
const IDB_VERSION = 1

const memCache = new Map()
const pendingFetches = new Map()
let currentAudio = null
let muted = false
let idbPromise = null

function cacheKey(text, voice) {
  return voice + '|' + text
}

function openIdb() {
  if (idbPromise) return idbPromise
  idbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') { resolve(null); return }
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return idbPromise
}

async function idbGet(key) {
  const db = await openIdb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function idbSet(key, blob) {
  const db = await openIdb()
  if (!db) return false
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(blob, key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

function memGet(key) {
  if (!memCache.has(key)) return null
  const val = memCache.get(key)
  memCache.delete(key)
  memCache.set(key, val)
  return val
}

function memSet(key, blobUrl) {
  if (memCache.has(key)) memCache.delete(key)
  memCache.set(key, blobUrl)
  if (memCache.size > CACHE_LIMIT) {
    const firstKey = memCache.keys().next().value
    const oldUrl = memCache.get(firstKey)
    try { URL.revokeObjectURL(oldUrl) } catch { /* noop */ }
    memCache.delete(firstKey)
  }
}

async function fetchAudioBlob(text, voice) {
  const res = await fetch(TTS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ text, voice }),
  })
  if (!res.ok) return null
  const blob = await res.blob()
  if (!blob || blob.size === 0) return null
  return blob
}

async function resolveAudioUrl(text, voice) {
  const key = cacheKey(text, voice)
  const hit = memGet(key)
  if (hit) return hit

  if (pendingFetches.has(key)) return pendingFetches.get(key)

  const task = (async () => {
    try {
      const idbBlob = await idbGet(key)
      if (idbBlob && idbBlob.size > 0) {
        const url = URL.createObjectURL(idbBlob)
        memSet(key, url)
        return url
      }
      const blob = await fetchAudioBlob(text, voice)
      if (!blob) return null
      const url = URL.createObjectURL(blob)
      memSet(key, url)
      idbSet(key, blob)
      return url
    } finally {
      pendingFetches.delete(key)
    }
  })()

  pendingFetches.set(key, task)
  return task
}

export function setMuted(v) {
  muted = !!v
  if (muted) stopSpeaking()
}

export function isMuted() {
  return muted
}

export function stopSpeaking() {
  if (currentAudio) {
    try { currentAudio.pause() } catch { /* noop */ }
    try { currentAudio.currentTime = 0 } catch { /* noop */ }
    currentAudio = null
  }
}

export async function speakArabicViaServer(text, options = {}) {
  if (muted) return false
  if (!text || typeof text !== 'string') return false
  const trimmed = text.trim()
  if (trimmed.length === 0 || trimmed.length > 500) return false

  const voice = options.voice || RANA_VOICE
  stopSpeaking()

  let audioUrl = null
  try {
    audioUrl = await resolveAudioUrl(trimmed, voice)
  } catch (err) {
    console.error('tts resolve failed:', err)
    return false
  }
  if (!audioUrl) return false

  return new Promise((resolve) => {
    try {
      const audio = new Audio(audioUrl)
      currentAudio = audio
      audio.onended = () => { currentAudio = null; resolve(true) }
      audio.onerror = () => { currentAudio = null; resolve(false) }
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.catch((err) => {
          console.error('audio play failed:', err)
          currentAudio = null
          resolve(false)
        })
      }
    } catch (err) {
      console.error('audio setup failed:', err)
      resolve(false)
    }
  })
}

export async function prefetchArabic(text, options = {}) {
  if (!text || typeof text !== 'string') return false
  const trimmed = text.trim()
  if (trimmed.length === 0 || trimmed.length > 500) return false
  const voice = options.voice || RANA_VOICE
  try {
    const url = await resolveAudioUrl(trimmed, voice)
    return !!url
  } catch {
    return false
  }
}

export function isTtsAvailable() {
  return typeof window !== 'undefined' && typeof fetch === 'function' && typeof Audio === 'function'
}