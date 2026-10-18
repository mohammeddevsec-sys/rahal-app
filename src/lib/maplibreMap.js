import { Map as MapLibreMap, Marker, addProtocol, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { Protocol, PMTiles } from 'pmtiles'
import { layers, namedFlavor } from '@protomaps/basemaps'
import { getOfflineSource, downloadAndStore, OFFLINE_SOURCE_KEY } from './offlinePMTiles.js'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl(workerUrl)

export const PMTILES_URL = '/maps/iraq.pmtiles'
export const PMTILES_MAX_DATA_ZOOM = 14
export const DEFAULT_CENTER = [44.3661, 33.3152]
export const DEFAULT_ZOOM = 7
export const USER_ZOOM = 15
export const GLYPHS_URL = 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf'
export const SPRITE_URL = 'https://protomaps.github.io/basemaps-assets/sprites/v4/light'


let protocolInstance = null

function ensureProtocol() {
  if (protocolInstance) return protocolInstance
  const protocol = new Protocol()
  addProtocol('pmtiles', protocol.tile)
  protocolInstance = protocol
  return protocol
}

function recolorLayers(baseLayers) {
  return baseLayers.map(function(l) {
    try {
      var id = (l.id || '').toLowerCase()
      if (l.type === 'background') {
        return Object.assign({}, l, { paint: { 'background-color': '#f5e8c8' } })
      }
      if (l.type === 'fill') {
        var nc = null
        if (id === 'earth') nc = '#f5e8c8'
        else if (id === 'landcover') nc = '#eaddbc'
        else if (id.indexOf('water') !== -1) nc = '#74c4ea'
        else if (id === 'landuse_park' || id === 'landuse_urban_green' || id === 'landuse_zoo') nc = '#98d898'
        else if (id === 'landuse_beach') nc = '#f5e0a0'
        else if (id === 'buildings') nc = '#d8ccb8'
        if (nc) {
          var p = Object.assign({}, l.paint || {})
          p['fill-color'] = nc
          p['fill-opacity'] = 1
          return Object.assign({}, l, { paint: p })
        }
      }
      if (l.type === 'line' && id.indexOf('roads_') === 0 && id.indexOf('casing') === -1) {
        var p2 = Object.assign({}, l.paint || {})
        p2['line-color'] = '#ffffff'
        delete p2['line-dasharray']
        return Object.assign({}, l, { paint: p2 })
      }
      if (l.type === 'line' && id.indexOf('roads_') === 0 && id.indexOf('casing') !== -1) {
        var p4 = Object.assign({}, l.paint || {})
        delete p4['line-dasharray']
        return Object.assign({}, l, { paint: p4 })
      }
      if (l.type === 'line' && id.indexOf('casing') !== -1) {
        var p3 = Object.assign({}, l.paint || {})
        p3['line-color'] = '#c8bca0'
        return Object.assign({}, l, { paint: p3 })
      }
    } catch { /* noop */ }
    return l
  })
}

function buildStyle(pmtilesUrl) {
  return {
    version: 8,
    glyphs: GLYPHS_URL,
    sprite: SPRITE_URL,
    sources: {
      protomaps: {
        type: 'vector',
        url: pmtilesUrl,
        attribution: 'Protomaps | OpenStreetMap',
      },
    },
    layers: recolorLayers(layers('protomaps', namedFlavor('light'), { lang: 'ar' })),
  }
}

export async function initMap(container) {
  const protocol = ensureProtocol()
  let pmtilesUrl = 'pmtiles://' + PMTILES_URL
  let isOffline = false

  try {
    const offline = await getOfflineSource()
    if (offline) {
      const pm = new PMTiles(offline)
      protocol.add(pm, OFFLINE_SOURCE_KEY)
      pmtilesUrl = 'pmtiles://' + OFFLINE_SOURCE_KEY
      isOffline = true
    }
  } catch (err) {
    console.error('offline source check failed:', err)
  }

  const map = new MapLibreMap({
    container,
    style: buildStyle(pmtilesUrl),
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    maxPitch: 85,
    maxZoom: PMTILES_MAX_DATA_ZOOM + 2,
    minZoom: 3,
    attributionControl: { compact: true },
    antialias: true,
    fadeDuration: 100,
    maxTileCacheSize: 512,
    maxTileCacheZoomLevels: 8,
    refreshExpiredTiles: false,
    trackResize: true,
    dragRotate: true,
    pitchWithRotate: true,
    touchZoomRotate: true,
    scrollZoom: true,
    doubleClickZoom: true,
    keyboard: true,
  })

  if (!isOffline) {
    map.once('load', () => {
      downloadAndStore()
        .then((r) => console.log('offline download done:', r))
        .catch((err) => console.error('offline download failed:', err))
    })
  }

    /* old load-block removed */

  if (typeof window !== 'undefined') window.__rahalMap = map;
  // Silence missing sprite image warnings (e.g. townhall)
  if (typeof map.setMissingStyleImageResolver === 'function') {
    map.setMissingStyleImageResolver(() => {
      const data = new Uint8Array(4)
      return { width: 1, height: 1, data }
    })
  }

  return { map, isOffline }
}

export function createMarker(element) {
  return new Marker({ element, anchor: 'center' })
}

export function createCircle(center, radiusMeters, points) {
  const n = points || 64
  const lng = center[0]
  const lat = center[1]
  const coords = []
  for (let i = 0; i <= n; i++) {
    const angle = (i / n) * 2 * Math.PI
    const dx = radiusMeters * Math.cos(angle)
    const dy = radiusMeters * Math.sin(angle)
    const dLat = dy / 111320
    const dLng = dx / (111320 * Math.cos((lat * Math.PI) / 180))
    coords.push([lng + dLng, lat + dLat])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

// DEBUG: dump layer IDs
window.__dumpLayers = () => { const m = window.__rahalMap; if (m) m.getStyle().layers.forEach(l => console.log(l.id, '|', l.type)); };







