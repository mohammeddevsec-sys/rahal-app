const API_BASE = 'http://localhost:3001/api'
const DEVICE_KEY = 'rahal.deviceId'

export const REPORT_TYPES = [
  { id: 'accident',      label: '\u062D\u0627\u062F\u062B',                                  color: '#dc2626', iconPath: '/icons_v3/accident.webp' },
  { id: 'traffic',       label: '\u0627\u0632\u062F\u062D\u0627\u0645 \u0645\u062A\u0648\u0633\u0637', color: '#d97706', iconPath: '/icons_v3/traffic.webp' },
  { id: 'traffic_heavy', label: '\u0627\u0632\u062F\u062D\u0627\u0645 \u0643\u0644\u064A',       color: '#991b1b', iconPath: '/icons_v3/traffic_heavy.webp' },
  { id: 'hazard',        label: '\u062E\u0637\u0631',                                         color: '#ea580c', iconPath: '/icons_v3/hazard.webp' },
  { id: 'road_work',     label: '\u0623\u0639\u0645\u0627\u0644 \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642', color: '#ca8a04', iconPath: '/icons_v3/road_work.webp' },
  { id: 'emergency',     label: '\u0637\u0648\u0627\u0631\u0626',                              color: '#dc2626', iconPath: '/icons_v3/emergency.webp' },
  { id: 'bad_weather',   label: '\u0637\u0642\u0633 \u0633\u064A\u0626',                        color: '#475569', iconPath: '/icons_v3/bad_weather.webp' },
  { id: 'checkpoint',    label: '\u0646\u0642\u0637\u0629 \u062A\u0641\u062A\u064A\u0634',      color: '#1e40af', iconPath: '/icons_v3/checkpoint.webp' },
  { id: 'camera',        label: '\u0643\u0627\u0645\u064A\u0631\u0627',                        color: '#0e7490', iconPath: '/icons_v3/camera.webp' },
  { id: 'speed_bump',    label: '\u0645\u0637\u0628',                                          color: '#334155', iconPath: '/icons_v3/speed_bump.webp' },
  { id: 'fuel',          label: '\u0645\u062D\u0637\u0629 \u0648\u0642\u0648\u062F',            color: '#1e40af', iconPath: '/icons_v3/fuel.webp' },
  { id: 'animals',       label: '\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642', color: '#65a30d', iconPath: '/icons_v3/animals.webp' },
]

export function getReportType(id) {
  return REPORT_TYPES.find((t) => t.id === id) || null
}

export function getDeviceId() {
  if (typeof window === 'undefined') return 'unknown'
  let id = window.localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = 'd-' + Date.now() + '-' + Math.floor(Math.random() * 1000000)
    window.localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

function mapReport(r) {
  return {
    id: r.id,
    type: r.type,
    lat: r.lat,
    lng: r.lng,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    confirmations: r.confirmations || 0,
    resolvedAt: r.resolved_at,
  }
}

export async function fetchActiveReports() {
  const res = await fetch(API_BASE + '/reports', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('fetch reports failed: ' + res.status)
  const data = await res.json()
  return (data.reports || []).map(mapReport)
}

export async function addReport(typeId, center) {
  const t = getReportType(typeId)
  if (!t) throw new Error('invalid type')
  if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
    throw new Error('invalid center')
  }
  const body = {
    type: typeId,
    lat: center.lat,
    lng: center.lng,
    deviceId: getDeviceId(),
  }
  const res = await fetch(API_BASE + '/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('create report failed: ' + res.status)
  const data = await res.json()
  return mapReport(data.report)
}

export async function confirmReport(reportId) {
  const res = await fetch(API_BASE + '/reports/' + reportId + '/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: getDeviceId() }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return mapReport(data.report)
}

export async function resolveReport(reportId) {
  const res = await fetch(API_BASE + '/reports/' + reportId + '/resolve', { method: 'POST' })
  return res.ok
}

export async function deleteReport(reportId) {
  const res = await fetch(API_BASE + '/reports/' + reportId, { method: 'DELETE' })
  return res.ok
}
