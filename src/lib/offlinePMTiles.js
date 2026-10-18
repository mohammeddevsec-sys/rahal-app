const DB_NAME = 'rahal-maps'
const TABLE_NAME = 'offline-pmtiles'
const FILE_NAME = 'iraq.pmtiles'
const FILE_URL = '/maps/iraq.pmtiles'
const SOURCE_KEY = 'rahal-iraq'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(TABLE_NAME)) {
        db.createObjectStore(TABLE_NAME, { keyPath: 'filename' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

async function getBlob() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TABLE_NAME, 'readonly')
    const store = tx.objectStore(TABLE_NAME)
    const req = store.get(FILE_NAME)
    req.onsuccess = () => {
      const rec = req.result
      resolve(rec && rec.blob ? rec.blob : null)
    }
    req.onerror = () => reject(req.error)
  })
}

export const OFFLINE_SOURCE_KEY = SOURCE_KEY

export async function getOfflineSource() {
  const blob = await getBlob()
  if (!blob || blob.size === 0) return null
  return {
    getKey: function () { return SOURCE_KEY },
    getBytes: async function (offset, length) {
      const slice = blob.slice(offset, offset + length)
      const data = await slice.arrayBuffer()
      return { data }
    },
  }
}

export async function downloadAndStore(onProgress) {
  const existing = await getBlob()
  if (existing && existing.size > 0) {
    return { cached: true, size: existing.size }
  }

  const res = await fetch(FILE_URL)
  if (!res.ok) throw new Error('fetch failed: ' + res.status)

  const total = parseInt(res.headers.get('content-length') || '0', 10)
  const reader = res.body.getReader()
  let received = 0

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) { controller.close(); return }
      received += value.length
      if (onProgress) onProgress(received, total)
      controller.enqueue(value)
    },
    cancel(reason) {
      try { reader.cancel(reason) } catch { /* noop */ }
    },
  })

  const blob = await new Response(stream).blob()

  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(TABLE_NAME, 'readwrite')
    const store = tx.objectStore(TABLE_NAME)
    store.put({ filename: FILE_NAME, blob })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  return { cached: false, size: blob.size }
}

export async function clearOffline() {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(TABLE_NAME, 'readwrite')
    const store = tx.objectStore(TABLE_NAME)
    store.delete(FILE_NAME)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}