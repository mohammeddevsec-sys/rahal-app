import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Marker } from 'maplibre-gl'
import { useUserLocation } from './hooks/useUserLocation.js'
import { GEO_STATUS } from './lib/geolocation.js'
import { initMap, createCircle, DEFAULT_CENTER, USER_ZOOM } from './lib/maplibreMap.js'
import { searchPlaces } from './lib/nominatim.js'
import { loadStats, addPoints, getLevelName } from './lib/gamification.js'
import { searchNearby, CATEGORIES } from './lib/overpass.js'
import { getRoute, formatDistanceArabic, formatDurationArabic, distanceToRoute } from './lib/routing.js'
import { matchPositionToRoute } from './lib/routeMatching.js'
import { spokenDistancePhrase } from './lib/arabic.js'
import { loadSearchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory } from './lib/searchHistory.js'
import { loadPlace, savePlace, clearPlace, HOME_KEY, WORK_KEY } from './lib/savedPlaces.js'
import { REPORT_TYPES, getReportType, fetchActiveReports, addReport, confirmReport, resolveReport } from './lib/reports.js'
import { speakArabicViaServer, stopSpeaking, isTtsAvailable, prefetchArabic } from './lib/tts.js'
import { toggleVoiceControl } from './lib/voiceControl.js'
import './App.css'

const UI_TEXT = Object.freeze({
  brand: '\u0631\u062D\u0651\u0627\u0644',
  subtitle: '\u0645\u0644\u0627\u062D\u0629 \u0627\u0644\u0639\u0631\u0627\u0642',
  myLocation: '\u0645\u0648\u0642\u0639\u064A',
  searchPlaceholder: '\u0625\u0644\u0649 \u0623\u064A\u0646 \u062A\u0631\u064A\u062F \u0627\u0644\u0630\u0647\u0627\u0628\u061F',
  searchLabel: '\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0648\u062C\u0647\u0629',
  searchClear: '\u0645\u0633\u062D \u0627\u0644\u0628\u062D\u062B',
  searchNoResults: '\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C',
  searchLoading: '\u062C\u0627\u0631\u064A \u0627\u0644\u0628\u062D\u062B',
  searchError: '\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B',
  searchRecent: '\u0622\u062E\u0631 \u0627\u0644\u0628\u062D\u0648\u062B',
  routingLoading: '\u062C\u0627\u0631\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u0631',
  routingError: '\u062A\u0639\u0630\u0631 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u0631',
  nextStepAfter: '\u0628\u0639\u062F',
  startTrip: '\u0627\u0628\u062F\u0623 \u0627\u0644\u0631\u062D\u0644\u0629',
  stopTrip: '\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0631\u062D\u0644\u0629',
  tripStarted: '\u0628\u062F\u0623\u062A \u0627\u0644\u0631\u062D\u0644\u0629',
  arrival: '\u0648\u0635\u0644\u062A \u0625\u0644\u0649 \u0627\u0644\u0648\u062C\u0647\u0629',
  home: '\u0627\u0644\u0645\u0646\u0632\u0644',
  work: '\u0627\u0644\u0639\u0645\u0644',
  nearby: '\u0623\u0645\u0627\u0643\u0646 \u0642\u0631\u064A\u0628\u0629',
  mapLabel: '\u062E\u0631\u064A\u0637\u0629 \u0631\u062D\u0651\u0627\u0644',
  zoomIn: '\u062A\u0643\u0628\u064A\u0631 \u0627\u0644\u062E\u0631\u064A\u0637\u0629',
  zoomOut: '\u062A\u0635\u063A\u064A\u0631 \u0627\u0644\u062E\u0631\u064A\u0637\u0629',
  locate: '\u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0642\u0639\u064A',
  roadReportTitle: '\u0645\u0627\u0630\u0627 \u064A\u062D\u062F\u062B \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642\u061F',
  roadReportSubtitle: '\u0633\u0627\u0647\u0645 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  accident: '\u062D\u0627\u062F\u062B',
  traffic: '\u0627\u0632\u062F\u062D\u0627\u0645',
  closure: '\u0625\u063A\u0644\u0627\u0642',
  hazard: '\u062E\u0637\u0631',
  navigation: '\u0627\u0644\u062A\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A',
  main: '\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629',
  saved: '\u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0627\u062A',
  places: '\u0627\u0644\u0623\u0645\u0627\u0643\u0646',
  more: '\u0627\u0644\u0645\u0632\u064A\u062F',
  comingSoon: '\u0642\u064A\u062F \u0627\u0644\u0625\u0646\u0634\u0627\u0621',
  savedEmpty: '\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u062D\u0648\u062B \u0645\u062D\u0641\u0648\u0638\u0629',
  setHome: '\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0645\u0646\u0632\u0644',
  setWork: '\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0639\u0645\u0644',
  homeNotSet: '\u0627\u0644\u0645\u0646\u0632\u0644 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F',
  workNotSet: '\u0627\u0644\u0639\u0645\u0644 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F',
  clearHome: '\u0645\u0633\u062D \u0627\u0644\u0645\u0646\u0632\u0644',
  clearWork: '\u0645\u0633\u062D \u0627\u0644\u0639\u0645\u0644',
  placesEmpty: '\u0644\u0645 \u062A\u062D\u062F\u062F \u0627\u0644\u0645\u0646\u0632\u0644 \u0623\u0648 \u0627\u0644\u0639\u0645\u0644 \u0628\u0639\u062F',
  settingsTitle: '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
  settingsMapSection: '\u0627\u0644\u062E\u0631\u064A\u0637\u0629',
  settingsPlacesSection: '\u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629',
  settingsAboutSection: '\u062D\u0648\u0644',
  settingsAboutText: '\u0631\u062D\u0651\u0627\u0644 - \u0645\u0644\u0627\u062D\u0629 \u0627\u0644\u0639\u0631\u0627\u0642',
  nearbyAlertFrom: '\u0645\u0646 \u0645\u0648\u0642\u0639\u0643',
  nearbyGone: '\u0644\u0627\u060C \u0627\u0646\u062A\u0647\u0649',
  reportOpen: '\u0625\u0628\u0644\u0627\u063A',
  reportPickType: '\u0627\u062E\u062A\u0631 \u0646\u0648\u0639 \u0627\u0644\u0628\u0644\u0627\u063A',
  nearbyPickCategory: '\u0627\u062E\u062A\u0631 \u0641\u0626\u0629:',
  nearbyEmpty: '\u0644\u0627 \u0646\u062A\u0627\u0626\u062C \u0642\u0631\u064A\u0628\u0629 \u062E\u0644\u0627\u0644 5 \u0643\u0645',
  nearbyClose: '\u0625\u063A\u0644\u0627\u0642',
  savedClear: '\u0645\u0633\u062D \u0627\u0644\u0633\u062C\u0644',
  gpsGranted: '\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0645\u0641\u0639\u0651\u0644',
  gpsRequesting: '\u062C\u0627\u0631\u064A \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0642\u0639',
  gpsDenied: '\u0625\u0630\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0631\u0641\u0648\u0636',
  gpsTimeout: '\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0642\u0639',
  gpsUnavailable: '\u0627\u0644\u0645\u0648\u0642\u0639 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D',
  gpsUnsupported: '\u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0644\u0627 \u064A\u062F\u0639\u0645 \u0627\u0644\u0645\u0648\u0642\u0639',
  gpsIdle: '\u0627\u0644\u0645\u0648\u0642\u0639 \u063A\u064A\u0631 \u0645\u0641\u0639\u0651\u0644',
  clearIcon: '\u00D7',
})

const SEARCH_DEBOUNCE_MS = 400
const SEARCH_MIN_LENGTH = 3
const SEARCH_ZOOM = 16
const ROUTE_SOURCE = 'route'
const ROUTE_LAYER_LINE = 'route-line'
const ROUTE_LAYER_OUTLINE = 'route-outline'

const VOICE_THRESHOLD_METERS = 350
const OFF_ROUTE_THRESHOLD_M = 50
const OFF_ROUTE_MIN_MS = 5000
const REROUTE_COOLDOWN_MS = 15000

function emptyRoute() {
  return { type: 'FeatureCollection', features: [] }
}

let speakLock = false

function cancelAllVoice() {
  stopSpeaking()
}

function metersBetween(a, b) {
  const dLat = (a.lat - b.lat) * 111320
  const dLng = (a.lng - b.lng) * 111320 * Math.cos((b.lat * Math.PI) / 180)
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

function speakArabic(text) {
  if (!text) return
  if (speakLock) return
  if (!isTtsAvailable()) return
  speakLock = true
  cancelAllVoice()

  const release = () => { speakLock = false }  const safetyTimer = setTimeout(() => { release() }, 8000)

  speakArabicViaServer(text).then(() => {    clearTimeout(safetyTimer)
    release()
  }).catch(() => {    clearTimeout(safetyTimer)
    release()
  })
}

function App() {
  window.rahalCameraRig = window.rahalCameraRig || { mode: 'FOLLOW', lastValidHeading: 0 };
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const lastReportRef = useRef({ type: null, lat: null, lng: null, time: 0 })
  const markerRef = useRef(null)
  const [isMicListening, setIsMicListening] = useState(false)
  const markerTargetRef = useRef({ lng: null, lat: null, heading: null })
  const markerSmoothRef = useRef({ lng: null, lat: null, heading: 0 })
  const centeredRef = useRef(false)
  const searchMarkerRef = useRef(null)
  const skipNextSearchRef = useRef('')
  const searchRequestRef = useRef(0)
  const reportsMarkersRef = useRef([])
  const searchResultMarkersRef = useRef([])
  const dismissedReportIdsRef = useRef(new Set())
  const destinationRef = useRef(null)
  const routeProgressRef = useRef(0)
  const offRouteSinceRef = useRef(0)
  const lastRerouteAtRef = useRef(0)
  const spokenStepsRef = useRef(new Set())
  const arrivalSpokenRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchStatus, setSearchStatus] = useState('idle')
  const [showResults, setShowResults] = useState(false)
  const [searchHistory, setSearchHistory] = useState(() => loadSearchHistory())
  const [homeVersion, setHomeVersion] = useState(0)
  const [showCategories, setShowCategories] = useState(false)
  const [reports, setReports] = useState([])
  const [userStats, setUserStats] = useState(() => loadStats())
  const [showPointsPopup, setShowPointsPopup] = useState(false)
  const [nearbyReport, setNearbyReport] = useState(null)
  const [activeAlert, setActiveAlert] = useState(null)

  // إغلاق التنبيه تلقائياً بعد 5 ثوانٍ
  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => setActiveAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert]);
  const triggeredAlertsRef = useRef(new Set());
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeStatus, setRouteStatus] = useState('idle')

  const typingWarnedRef = useRef(false)



  const [tripActive, setTripActive] = useState(false)
  const tripActiveRef = useRef(false)
  const isDraggingRef = useRef(false)
  const followLockRef = useRef(false)
  const [followLocked, setFollowLocked] = useState(false)
  useEffect(() => { tripActiveRef.current = tripActive }, [tripActive])
  const { location, status, request } = useUserLocation()

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    let cancelled = false
    let localMap = null
    let localMarker = null

    initMap(container).then(({ map }) => {
      if (cancelled) { map.remove(); return }
      localMap = map
      mapRef.current = map

      map.on('load', () => {
        /* moveend pitch lock removed */
        if (cancelled) return

        map.addSource('accuracy', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({
          id: 'accuracy-fill',
          type: 'fill',
          source: 'accuracy',
          paint: { 'fill-color': '#0b63ce', 'fill-opacity': 0.15 },
        })
        map.addLayer({
          id: 'accuracy-outline',
          type: 'line',
          source: 'accuracy',
          paint: { 'line-color': '#0b63ce', 'line-width': 1 },
        })

        map.addSource(ROUTE_SOURCE, { type: 'geojson', data: emptyRoute() })
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: ROUTE_SOURCE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#0b63ce', 'line-width': 18, 'line-opacity': 0.14, 'line-blur': 8 },
        })
        map.addLayer({
          id: ROUTE_LAYER_OUTLINE,
          type: 'line',
          source: ROUTE_SOURCE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#4c1d95',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 13, 6, 15, 10, 18, 14],
            'line-opacity': 1,
          },
        })
        map.addLayer({
          id: ROUTE_LAYER_LINE,
          type: 'line',
          source: ROUTE_SOURCE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#8b5cf6',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 13, 4, 15, 7, 18, 10],
            'line-opacity': 1,
          },
        })

        map.addSource('traffic-moderate', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'traffic-moderate-layer',
          type: 'line',
          source: 'traffic-moderate',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#f59e0b', 'line-width': 7, 'line-opacity': 1 },
        })
        map.addSource('traffic-heavy', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'traffic-heavy-layer',
          type: 'line',
          source: 'traffic-heavy',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#dc2626', 'line-width': 7, 'line-opacity': 1 },
        })

        const el = document.createElement('div')
        el.className = 'user-marker'
        el.innerHTML = `
      <div class="rahal-car-3d" style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 44 44" style="width: 44px; height: 44px; overflow: visible;">
          <defs>
            <radialGradient id="groundShadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(15, 23, 42, 0.75)" />
              <stop offset="55%" stop-color="rgba(15, 23, 42, 0.40)" />
              <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
            </radialGradient>
            <linearGradient id="carCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38e1ff"/>
              <stop offset="50%" stop-color="#00b4d8"/>
              <stop offset="100%" stop-color="#0077b6"/>
            </linearGradient>
          </defs>
          <ellipse cx="22" cy="30" rx="16" ry="7" fill="url(#groundShadowGrad)" />
          <path d="M 22 4 L 39 34 C 34 30.5, 27 29, 22 29 C 17 29, 10 30.5, 5 34 Z" fill="url(#carCyanGrad)" stroke="#ffffff" stroke-width="2.8" stroke-linejoin="round"/>
        </svg>
      </div>
    `
        localMarker = new Marker({ element: el, anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' })
          .setLngLat(DEFAULT_CENTER)
          .addTo(map)
        markerRef.current = localMarker

        setMapReady(true)
      })

      map.on('error', (e) => {
        const msg = e && e.error ? e.error.message : String(e)
        console.error('Map error:', msg)
      })
    }).catch((err) => {
      console.error('Map init failed:', err)
      if (!cancelled) setMapError(String(err && err.message ? err.message : err))
    })

    return () => {
      cancelled = true
      if (localMarker) localMarker.remove()
      if (localMap) localMap.remove()
      mapRef.current = null
      markerRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !location) return
          const { lat, lng, accuracy, heading } = location

          // حماية من إحداثيات NaN (تمنع القفز العشوائي)
          if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng)) {
            return;
          }

          let targetLng = lng
          let targetLat = lat
          let routeBearing = null
          const routeCoords = routeInfo?.geometry?.coordinates
          if (tripActive && routeCoords && routeCoords.length >= 2) {
            const match = matchPositionToRoute([lng, lat], routeCoords, routeProgressRef.current, accuracy)
            if (match) {
              routeProgressRef.current = Math.max(routeProgressRef.current, match.segmentIndex)
              targetLng = match.coordinate[0]
              targetLat = match.coordinate[1]
              routeBearing = match.bearing
            }
          }
          markerTargetRef.current.lng = targetLng
          markerTargetRef.current.lat = targetLat
          if (tripActive && followLockRef.current && !isDraggingRef.current) {
            map.easeTo({
              center: [targetLng, targetLat],
              bearing: typeof effHeading === 'number' ? effHeading : (markerTargetRef.current.heading || 0),
              pitch: 60,
              zoom: 17.5,
              padding: { top: 0, bottom: Math.round((map.getContainer().clientHeight || 600) * 0.35), left: 0, right: 0 },
              duration: 1000,
              essential: true
            });
          }
          let effHeading = heading
          const spd = typeof location.speed === 'number' ? Math.abs(location.speed) : 0
          const previousHeading = markerTargetRef.current.heading
          if (typeof effHeading !== 'number' || !Number.isFinite(effHeading) || spd < 1.2) {
            if (typeof routeBearing === 'number' && Number.isFinite(routeBearing)) {
              effHeading = routeBearing
            } else if (typeof previousHeading === 'number' && Number.isFinite(previousHeading)) {
              effHeading = previousHeading
            } else {
              const dest = destinationRef.current
              if (dest) {
                const dLat = dest.lat - lat
                const dLng = (dest.lng - lng) * Math.cos(lat * Math.PI / 180)
                if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) {
                  effHeading = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360
                }
              }
            }
          }
          if (typeof effHeading === 'number' && Number.isFinite(effHeading)) {
            markerTargetRef.current.heading = ((effHeading % 360) + 360) % 360
          }

          // تتبع الكاميرا للسيارة بزاوية 60 وهامش سفلي 35% بانسيابية تامة دون تضارب
          if (tripActive && followLockRef.current && !isDraggingRef.current) {
            const bottomPadding = Math.round((map.getContainer().clientHeight || window.innerHeight || 600) * 0.35);
            map.easeTo({
              center: [targetLng, targetLat],
              bearing: typeof effHeading === 'number' ? effHeading : (markerTargetRef.current.heading || 0),
              pitch: 60,
              zoom: 17.5,
              padding: { top: 0, bottom: bottomPadding, left: 0, right: 0 },
              duration: 1000,
              easing: (t) => t,
              essential: true,
            });
          }

    const src = map.getSource('accuracy')
    if (src && accuracy && accuracy > 0) {
      src.setData({
        type: 'FeatureCollection',
        features: [createCircle([lng, lat], accuracy)],
      })
    }

    if (!centeredRef.current) {
      map.flyTo({ center: [lng, lat], zoom: USER_ZOOM, animate: true })
      centeredRef.current = true
    }
  }, [location, mapReady, routeInfo, tripActive])

  useEffect(() => {
    if (activeTab !== 'home' || !mapRef.current) return
    const t = setTimeout(() => {
      try { mapRef.current.resize() } catch { /* noop */ }
    }, 50)
    return () => clearTimeout(t)
  }, [activeTab])

  useEffect(() => {
    const trimmed = searchQuery.trim()

    if (skipNextSearchRef.current && skipNextSearchRef.current === trimmed) {
      skipNextSearchRef.current = ''
      return
    }

    const requestId = ++searchRequestRef.current
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      const id = setTimeout(() => {
        setSearchResults([])
        setSearchStatus('idle')
      }, 0)
      return () => clearTimeout(id)
    }

    const id = setTimeout(() => {
      setSearchStatus('loading')
      const mapNow = mapRef.current
      const center = mapNow ? { lat: mapNow.getCenter().lat, lng: mapNow.getCenter().lng } : null
      searchPlaces(trimmed, { center }).then((results) => {
        if (requestId !== searchRequestRef.current) return
        setSearchResults(results)
        setSearchStatus(results.length === 0 ? 'empty' : 'done')
      }).catch((err) => {
        if (requestId !== searchRequestRef.current) return
        console.error('search failed:', err)
        setSearchResults([])
        setSearchStatus('error')
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(id)
  }, [searchQuery])

  const clearRoute = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const src = map.getSource(ROUTE_SOURCE)
    if (src) src.setData(emptyRoute())
    setRouteInfo(null)
    setRouteStatus('idle')
    setTripActive(false)
    spokenStepsRef.current = new Set()
    arrivalSpokenRef.current = false
    destinationRef.current = null
    offRouteSinceRef.current = 0
    lastRerouteAtRef.current = 0
  }, [])

  const applyRoute = useCallback((route) => {
    const map = mapRef.current
    if (!map || !route) return
    routeProgressRef.current = 0
    const src = map.getSource(ROUTE_SOURCE)
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        }],
      })
    }
    setRouteInfo(route)
    setRouteStatus('done')
    spokenStepsRef.current = new Set()
    arrivalSpokenRef.current = false

    const coords = route.geometry.coordinates
    if (coords && coords.length > 0 && !tripActiveRef.current && !followLockRef.current) {
      const lngs = coords.map((c) => c[0])
      const lats = coords.map((c) => c[1])
      const bounds = [
        [Math.min.apply(null, lngs), Math.min.apply(null, lats)],
        [Math.max.apply(null, lngs), Math.max.apply(null, lats)],
      ]
      map.fitBounds(bounds, { padding: 60, animate: true, duration: 800 })
    }
  }, [])

  const handleSelectResult = useCallback(async (result) => {
    const map = mapRef.current
    if (!map) return

    addSearchHistory({
      name: result.name,
      fullName: result.fullName,
      lat: result.lat,
      lng: result.lng,
    })
    setSearchHistory(loadSearchHistory())

    if (searchMarkerRef.current) searchMarkerRef.current.remove()
    const el = document.createElement('div')
    el.className = 'search-marker'
    searchMarkerRef.current = new Marker({ element: el, anchor: 'bottom' })
      .setLngLat([result.lng, result.lat])
      .addTo(map)

    skipNextSearchRef.current = result.name
    setSearchQuery(result.name)
    setShowResults(false)
    destinationRef.current = { lat: result.lat, lng: result.lng, name: result.name }

    if (!location) {
      map.flyTo({ center: [result.lng, result.lat], zoom: SEARCH_ZOOM, duration: 1400, speed: 1.6, curve: 1.42, essential: true })
      return
    }

    setRouteStatus('loading')
    try {
      const route = await getRoute(
        { lat: location.lat, lng: location.lng },
        { lat: result.lat, lng: result.lng },
      )
      if (!route) {
        setRouteStatus('error')
        setRouteInfo(null)
        return
      }
      applyRoute(route)
    } catch (err) {
      console.error('routing failed:', err)
      setRouteStatus('error')
      setRouteInfo(null)
    }
  }, [location, applyRoute])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchStatus('idle')
    setShowResults(false)
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove()
      searchMarkerRef.current = null
    }
    clearRoute()
  }, [clearRoute])

  const handleRemoveHistoryItem = useCallback((entry) => {
    removeSearchHistory(entry)
    setSearchHistory(loadSearchHistory())
  }, [])

  const handleClearHistory = useCallback(() => {
    clearSearchHistory()
    setSearchHistory([])
  }, [])

  const goToUser = useCallback(async () => {
    const map = mapRef.current
    if (!map) return

    const moveTo = (lat, lng) => {
      const current = map.getCenter()
      const dLat = (lat - current.lat) * 111320
      const dLng = (lng - current.lng) * 111320 * Math.cos((lat * Math.PI) / 180)
      const distMeters = Math.sqrt(dLat * dLat + dLng * dLng)
      if (distMeters < 500) {
        map.easeTo({
          center: [lng, lat],
          zoom: USER_ZOOM,
          duration: 800,
          easing: (t) => t * (2 - t),
          essential: true,
        })
      } else {
        map.flyTo({
          center: [lng, lat],
          zoom: USER_ZOOM,
          duration: 1400,
          speed: 1.6,
          curve: 1.42,
          essential: true,
        })
      }
    }

    if (location) {
      moveTo(location.lat, location.lng)
      return
    }
    const pos = await request()
    if (pos) {
      moveTo(pos.lat, pos.lng)
    }
  }, [location, request])

  const zoomIn = useCallback(() => {
    const m = mapRef.current
    if (m) m.setZoom(Math.min(m.getZoom() + 1.5, 22))
  }, [])

  const zoomOut = useCallback(() => {
    const m = mapRef.current
    if (m) m.setZoom(Math.max(m.getZoom() - 1.5, 3))
  }, [])

  const startTrip = useCallback(() => {
    if (!routeInfo) { speakArabic('الرجاء اختيار وجهة أولاً'); return }
    followLockRef.current = true
    setFollowLocked(true)
    const map = mapRef.current
    if (map) {
      map.jumpTo({
        pitch: 60,
        zoom: 17.5,
        padding: { bottom: Math.round(window.innerHeight * 0.35), top: 0, left: 0, right: 0 }
      });
    }
    if (map) {
      try { map.dragPan.enable() } catch { /* noop */ }
      try { map.touchPitch.disable() } catch { /* noop */ }
      try { map.touchZoomRotate.disableRotation() } catch { /* noop */ }
    }
    setTripActive(true)
    speakArabic(UI_TEXT.tripStarted + '، قُد بحذر')
    typingWarnedRef.current = false
    spokenStepsRef.current = new Set()
    arrivalSpokenRef.current = false
    
    /* silent start trip */
    const dest = destinationRef.current
    if (dest && location) {
      getRoute(
        { lat: location.lat, lng: location.lng },
        { lat: dest.lat, lng: dest.lng },
      ).then((route) => { if (route) applyRoute(route) }).catch(() => {})
    }

    if (map) {
      map.stop()
      const bottomPad = Math.round((map.getContainer().clientHeight || window.innerHeight || 600) * 0.35)
      let h = markerTargetRef.current.heading
      if (location) {
        const startSpeed = typeof location.speed === 'number' ? Math.abs(location.speed) : 0
        if (typeof location.heading === 'number' && Number.isFinite(location.heading) && startSpeed >= 1.2) {
          h = location.heading
        }
        if (typeof h !== 'number' || !Number.isFinite(h)) {
          if (dest) {
            const dLat = dest.lat - location.lat
            const dLng = (dest.lng - location.lng) * Math.cos(location.lat * Math.PI / 180)
            if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) h = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360
          }
        }
      }
      if (typeof h !== 'number' || !Number.isFinite(h)) h = 0
      h = ((h % 360) + 360) % 360

      const centerCoord = [
        markerTargetRef.current.lng || location?.lng || DEFAULT_CENTER[0],
        markerTargetRef.current.lat || location?.lat || DEFAULT_CENTER[1]
      ]

      map.easeTo({
        center: centerCoord,
        bearing: h,
        pitch: 60,
        zoom: 17.5,
        padding: { top: 0, bottom: bottomPad, left: 0, right: 0 },
        duration: 1000,
        essential: true,
      })
    }
  }, [routeInfo, location, applyRoute])

  useEffect(() => {
    if (!tripActive || !location || !mapRef.current) return;
    // إجبار الكاميرا على العودة لموقعك عند بدء الرحلة
    const map = mapRef.current;
    if (window.rahalCameraRig.mode === 'FOLLOW') {
        map.easeTo({
            center: [location.lng, location.lat],
            zoom: 17.5,
            pitch: 55,
            padding: { top: Math.round((map.getContainer().clientHeight || 600) * 0.40), bottom: 0, left: 0, right: 0 },
            duration: 1000,
            essential: true
        });
        window.rahalCameraRig.mode = 'RECENTER'; // منع التكرار
        setTimeout(() => { window.rahalCameraRig.mode = 'FOLLOW'; }, 1200);
    }
  }, [tripActive, location]);


  
  const stopTrip = useCallback(() => {
    console.log("STOP_TRIP_EXECUTED")
    if (followLockRef.current) {
      followLockRef.current = false;
      setFollowLocked(false);
      const m0 = mapRef.current;
      if (m0) {
        try { m0.dragPan.enable(); } catch { /* noop */ }
        try { m0.touchPitch.enable(); } catch { /* noop */ }
        try { m0.touchZoomRotate.enableRotation(); } catch { /* noop */ }
      }
    };
    setTripActive(false)
    stopSpeaking()
    
    const stopMap = mapRef.current;
    if (stopMap) {
      stopMap.easeTo({
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        pitch: 0,
        duration: 800
      });
    }
    const navReset = mapRef.current
    if (navReset) {
      try { navReset.setPadding({ top: 0, bottom: 0, left: 0, right: 0 }) } catch { /* noop */ }
      try { navReset.easeTo({ pitch: 0, bearing: 0, duration: 600, essential: true }) } catch { /* noop */ }
    }
    const map = mapRef.current
    if (map) {
      const src = map.getSource(ROUTE_SOURCE)
      if (src) src.setData(emptyRoute())
    }
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove()
      searchMarkerRef.current = null
    }
    setRouteInfo(null)
    setRouteStatus('idle')
    setSearchQuery('')
    setSearchResults([])
    setSearchStatus('idle')
    setShowResults(false)
    spokenStepsRef.current = new Set()
    arrivalSpokenRef.current = false
  }, [])

  const handleSaveHome = useCallback(() => {
    if (!location) return
    savePlace(HOME_KEY, { name: '\u0627\u0644\u0645\u0646\u0632\u0644', fullName: '', lat: location.lat, lng: location.lng })
    setHomeVersion((v) => v + 1)
  }, [location])


  const handleSaveWork = useCallback(() => {
    if (!location) return
    savePlace(WORK_KEY, { name: '\u0627\u0644\u0639\u0645\u0644', fullName: '', lat: location.lat, lng: location.lng })
    setHomeVersion((v) => v + 1)
  }, [location])

  const handleClearHome = useCallback(() => {
    clearPlace(HOME_KEY)
    setHomeVersion((v) => v + 1)
  }, [])

  const handleClearWork = useCallback(() => {
    clearPlace(WORK_KEY)
    setHomeVersion((v) => v + 1)
  }, [])

  const routeToDestination = useCallback(async (dest) => {
    if (tripActive) {
      speakArabic(UI_TEXT.tripStarted + '\u060C \u0642\u064F\u062F \u0628\u062D\u0630\u0631')
    }

    const map = mapRef.current
    if (!map || !dest) return

    if (searchMarkerRef.current) searchMarkerRef.current.remove()
    const el = document.createElement('div')
    el.className = 'search-marker'
    searchMarkerRef.current = new Marker({ element: el, anchor: 'bottom' })
      .setLngLat([dest.lng, dest.lat])
      .addTo(map)

    setSearchQuery(dest.name || '')
    skipNextSearchRef.current = dest.name || ''
    setShowResults(false)
    destinationRef.current = { lat: dest.lat, lng: dest.lng, name: dest.name || '' }

    if (!location) {
      map.flyTo({ center: [dest.lng, dest.lat], zoom: SEARCH_ZOOM, duration: 1400, speed: 1.6, curve: 1.42, essential: true })
      return
    }

    setRouteStatus('loading')
    try {
      const route = await getRoute(
        { lat: location.lat, lng: location.lng },
        { lat: dest.lat, lng: dest.lng },
      )
      if (!route) {
        setRouteStatus('error')
        setRouteInfo(null)
        return
      }
      applyRoute(route)
    } catch (err) {
      console.error('routing failed:', err)
      setRouteStatus('error')
      setRouteInfo(null)
    }
  }, [location, applyRoute, tripActive])

  const handleGoHome = useCallback(() => {
    const home = loadPlace(HOME_KEY)
    if (!home) { setActiveTab('settings'); return }
    routeToDestination(home)
  }, [routeToDestination])

  const handleGoWork = useCallback(() => {
    const work = loadPlace(WORK_KEY)
    if (!work) { setActiveTab('settings'); return }
    routeToDestination(work)
  }, [routeToDestination])

  const handleNearby = useCallback(() => {
    setShowCategories(true)
    setShowResults(false)
    setSearchQuery('')
    setSearchResults([])
    setSearchStatus('idle')
    skipNextSearchRef.current = ''
  }, [])

  const handlePickCategory = useCallback(async (categoryId) => {
    const map = mapRef.current
    if (!map) return
    const requestId = ++searchRequestRef.current
    const center = location
      ? { lat: location.lat, lng: location.lng }
      : { lat: map.getCenter().lat, lng: map.getCenter().lng }

    const cat = CATEGORIES.find((c) => c.id === categoryId)
    const label = cat ? cat.label : ''

    setShowCategories(false)
    setSearchStatus('loading')
    setShowResults(true)
    skipNextSearchRef.current = label
    setSearchQuery(label)
    setSearchResults([])

    try {
      const results = await searchNearby(categoryId, center, { radius: 5000 })
      if (requestId !== searchRequestRef.current) return
      setSearchResults(results)
      setSearchStatus(results.length === 0 ? 'empty' : 'done')
    } catch (err) {
      if (requestId !== searchRequestRef.current) return
      console.error('nearby failed:', err)
      setSearchStatus('error')
    }
  }, [location])

  const handleVoiceFreeSearch = useCallback(async (query) => {
    const requestId = ++searchRequestRef.current
    setSearchQuery(query)
    setSearchStatus('loading')
    setShowResults(true)
    setSearchResults([])
    try {
      const results = await searchPlaces(query)
      if (requestId !== searchRequestRef.current) return
      setSearchResults(results)
      setSearchStatus(results.length === 0 ? 'empty' : 'done')
      const map = mapRef.current
      if (map && results.length > 0) {
        map.flyTo({ center: [results[0].lng, results[0].lat], zoom: 14, duration: 1500 })
      }
    } catch (err) {
      if (requestId !== searchRequestRef.current) return
      console.error('voice free search failed:', err)
      setSearchStatus('error')
    }
  }, [])

  const handleVoiceClick = useCallback(() => {
    toggleVoiceControl({
      getMap: () => mapRef.current,
      setActiveTab,
      submitReport: async (type, gps) => {
        const now = Date.now()
        if (lastReportRef.current.type === type && now - lastReportRef.current.time < 15000) {
          console.log('DUPLICATE_VOICE_BLOCKED:', type)
          return
        }
        lastReportRef.current = { type, time: now }

        const rep = await addReport(type, gps)
        setUserStats(prev => addPoints(3, prev))
        setShowPointsPopup(true)
        setTimeout(() => setShowPointsPopup(false), 2500)
        setReports((prev) => [...prev, rep])
      },
      onStartTrip: startTrip,
      onStopTrip: stopTrip,
      hasRoute: !!routeInfo,
      tripActive: tripActive,
      onNearbySearch: handlePickCategory,
      onFreeSearch: handleVoiceFreeSearch,
      onStateChange: setIsMicListening,
      getRouteStats: () => {
        if (nextStepRef.current) {
          return { distance: nextStepRef.current.remainingDistance, duration: nextStepRef.current.remainingDuration };
        }
        return null;
      },
    })
  }, [routeInfo, startTrip, stopTrip, tripActive, handlePickCategory, handleVoiceFreeSearch])

  const handleCloseCategories = useCallback(() => {
    setShowCategories(false)
  }, [])

  
  
  const handleAddReport = useCallback(async (typeId, coords) => {
    const map = mapRef.current
    if (!map) return
    const center = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'
      ? { lat: coords.lat, lng: coords.lng }
      : (location
        ? { lat: location.lat, lng: location.lng }
        : { lat: map.getCenter().lat, lng: map.getCenter().lng })

    const now = Date.now()
    if (lastReportRef.current.type === typeId && now - lastReportRef.current.time < 15000) {
      console.log('DUPLICATE_MANUAL_BLOCKED:', typeId)
      return
    }
    lastReportRef.current = { type: typeId, time: now }

    const rep = await addReport(typeId, center)
    setUserStats(prev => addPoints(3, prev))
    setShowPointsPopup(true)
    setTimeout(() => setShowPointsPopup(false), 2500)
    setReports((prev) => [...prev, rep])
  }, [location])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    for (let i = 0; i < reportsMarkersRef.current.length; i++) {
      try { reportsMarkersRef.current[i].remove() } catch { /* noop */ }
    }
    reportsMarkersRef.current = []

    for (let i = 0; i < reports.length; i++) {
      const r = reports[i]
      const t = REPORT_TYPES.find((x) => x.id === r.type)
      if (!t) continue
      const el = document.createElement('div')
      el.className = 'report-marker'
      const img = document.createElement('img')
      img.src = t.iconPath
      img.alt = t.label
      let dup = 0
      const cosLat = Math.cos(r.lat * Math.PI / 180)
      for (let j = 0; j < i; j++) {
        const o = reports[j]
        const dLat = (o.lat - r.lat) * 111320
        const dLng = (o.lng - r.lng) * 111320 * cosLat
        if (Math.sqrt(dLat * dLat + dLng * dLng) < 25) dup++
      }
      if (dup > 0) {
        const ang = dup * 2.399963
        const rad = 16 + Math.floor(dup / 6) * 14
        img.style.transform = 'translate(' + (Math.cos(ang) * rad).toFixed(1) + 'px, ' + (Math.sin(ang) * rad).toFixed(1) + 'px)'
      }
      el.appendChild(img)
      const marker = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat([r.lng, r.lat])
        .addTo(map)
      reportsMarkersRef.current.push(marker)
    }

    return () => {
      for (let i = 0; i < reportsMarkersRef.current.length; i++) {
        try { reportsMarkersRef.current[i].remove() } catch { /* noop */ }
      }
      reportsMarkersRef.current = []
    }
  }, [reports, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const m of searchResultMarkersRef.current) {
      try { m.remove() } catch { /* noop */ }
    }
    searchResultMarkersRef.current = []
    if (!searchResults || searchResults.length === 0) return
    for (const r of searchResults) {
      if (typeof r.lat !== 'number' || typeof r.lng !== 'number') continue
      const el = document.createElement('div')
      el.className = 'search-result-marker'
      const marker = new Marker({ element: el, anchor: 'center' })
        .setLngLat([r.lng, r.lat])
        .addTo(map)
      searchResultMarkersRef.current.push(marker)
    }
    return () => {
      for (const m of searchResultMarkersRef.current) {
        try { m.remove() } catch { /* noop */ }
      }
      searchResultMarkersRef.current = []
    }
  }, [searchResults])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return

    const clearAll = () => {
      const ms = map.getSource('traffic-moderate')
      if (ms) ms.setData({ type: 'FeatureCollection', features: [] })
      const hs = map.getSource('traffic-heavy')
      if (hs) hs.setData({ type: 'FeatureCollection', features: [] })
    }

    if (!reports || !routeInfo) { clearAll(); return }

    const g = routeInfo.geometry || routeInfo.coords
    const coords = Array.isArray(g) ? g : (g && g.coordinates)
    if (!coords || coords.length < 2) { clearAll(); return }

    const RADIUS_M = 50
    const ORANGE_THRESHOLD = 1
    const RED_THRESHOLD = 3
    const moderateSegs = []
    const heavySegs = []
    let curMod = []
    let curHeavy = []

    for (let i = 0; i < coords.length; i++) {
      const p = coords[i]
      let count = 0
      for (let j = 0; j < reports.length; j++) {
        const r = reports[j]
        if (r.type !== 'traffic' && r.type !== 'traffic_heavy') continue
        const d = metersBetween({ lat: p[1], lng: p[0] }, r)
        if (d <= RADIUS_M) count++
      }
      if (count >= RED_THRESHOLD) {
        if (curMod.length >= 2) moderateSegs.push(curMod)
        curMod = []
        curHeavy.push(p)
      } else if (count >= ORANGE_THRESHOLD) {
        if (curHeavy.length >= 2) heavySegs.push(curHeavy)
        curHeavy = []
        curMod.push(p)
      } else {
        if (curMod.length >= 2) moderateSegs.push(curMod)
        if (curHeavy.length >= 2) heavySegs.push(curHeavy)
        curMod = []
        curHeavy = []
      }
    }
    if (curMod.length >= 2) moderateSegs.push(curMod)
    if (curHeavy.length >= 2) heavySegs.push(curHeavy)

    const toGeo = (segs) => ({
      type: 'FeatureCollection',
      features: segs.map((seg) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: seg },
      })),
    })

    const ms = map.getSource('traffic-moderate')
    if (ms) ms.setData(toGeo(moderateSegs))
    const hs = map.getSource('traffic-heavy')
    if (hs) hs.setData(toGeo(heavySegs))
  }, [mapReady, reports, routeInfo])

  useEffect(() => {
    let cancelled = false
    let intervalId;
    const load = async () => {
      try {
        const list = await fetchActiveReports()
        if (!cancelled) setReports(list)
      } catch (err) {
        console.error('fetch reports failed:', err)
      }
    }
    
    load()
    // تحديث البلاغات كل 30 ثانية لإزالة المنتهية تلقائياً
    intervalId = setInterval(load, 30000)
    
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
    const id = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      if (!location) {
        setNearbyReport(null)
        return
      }
      const now = Date.now()
      let best = null
      let bestD = Infinity
      for (let i = 0; i < reports.length; i++) {
        const r = reports[i]
        if (dismissedReportIdsRef.current.has(r.id)) continue
        if (r.resolvedAt) continue
        if (r.expiresAt && r.expiresAt <= now) continue
        const d = metersBetween(location, r)

        if (d < 200 && d < bestD) {
          bestD = d
          best = r
        }
      }
      setNearbyReport(best)
    }, 0)
    return () => clearTimeout(id)
  }, [location, reports, tripActive])

  const handleConfirmNearby = useCallback(async (report) => {
    if (!report) return
    try {
      await confirmReport(report.id)
      const list = await fetchActiveReports()
      setReports(list)
    } catch (err) {
      console.error('confirm nearby failed:', err)
    }
    setNearbyReport(null)
  }, [])

  const handleResolveNearby = useCallback(async (report) => {
    if (!report) return
    try {
      await resolveReport(report.id)
      const list = await fetchActiveReports()
      setReports(list)
    } catch (err) {
      console.error('resolve nearby failed:', err)
    }
    setNearbyReport(null)
  }, [])

  const handleDismissNearby = useCallback((report) => {
    if (!report) return
    dismissedReportIdsRef.current.add(report.id)
    setNearbyReport(null)
  }, [])

  useEffect(() => {
    const dest = destinationRef.current
    if (!dest || !routeInfo || !location) return
    if (routeStatus !== 'done') return
    const coords = routeInfo.geometry && routeInfo.geometry.coordinates
    if (!coords || coords.length < 2) return
    const point = [location.lng, location.lat]
    const dist = distanceToRoute(point, coords)

    if (dist < OFF_ROUTE_THRESHOLD_M) {
      offRouteSinceRef.current = 0
      return
    }

    const now = Date.now()
    if (!offRouteSinceRef.current) {
      offRouteSinceRef.current = now
      return
    }
    const offDuration = now - offRouteSinceRef.current
    if (offDuration < OFF_ROUTE_MIN_MS) return
    if (now - lastRerouteAtRef.current < REROUTE_COOLDOWN_MS) return

    lastRerouteAtRef.current = now
    offRouteSinceRef.current = 0

    getRoute(
      { lat: location.lat, lng: location.lng },
      { lat: dest.lat, lng: dest.lng },
    ).then((route) => {
      if (!route) return
      speakArabic('\u062A\u0645 \u0625\u064A\u062C\u0627\u062F \u0645\u0633\u0627\u0631 \u062C\u062F\u064A\u062F')
      applyRoute(route)
    }).catch((err) => {
      console.error('reroute failed:', err)
    })
  }, [location, routeInfo, routeStatus, applyRoute])


  const statusLabel = (() => {
    if (status === GEO_STATUS.GRANTED) return UI_TEXT.gpsGranted
    if (status === GEO_STATUS.REQUESTING) return UI_TEXT.gpsRequesting
    if (status === GEO_STATUS.DENIED) return UI_TEXT.gpsDenied
    if (status === GEO_STATUS.TIMEOUT) return UI_TEXT.gpsTimeout
    if (status === GEO_STATUS.UNAVAILABLE) return UI_TEXT.gpsUnavailable
    if (status === GEO_STATUS.UNSUPPORTED) return UI_TEXT.gpsUnsupported
    return UI_TEXT.gpsIdle
  })()

  const homePlace = loadPlace(HOME_KEY)
  const workPlace = loadPlace(WORK_KEY)
  const statusClass = 'gps-pill gps-' + status
  const searchActive = searchQuery.trim().length >= SEARCH_MIN_LENGTH

  useEffect(() => {
  if (typeof window !== 'undefined') window.__rahalRoute = routeInfo
}, [routeInfo])

useEffect(() => {
  if (typeof window !== 'undefined') {
    window.__rahalSetPos = (lng, lat, heading) => {
        if (markerTargetRef.current.lat !== null) {
          const dLat = lat - markerTargetRef.current.lat
          const dLng = (lng - markerTargetRef.current.lng) * Math.cos(lat * Math.PI / 180)
          const distMeters = Math.sqrt(dLat*dLat + dLng*dLng) * 111320
          if (distMeters < 3) return // تجاهل اهتزاز الـ GPS
        }
        markerTargetRef.current.lng = lng
        markerTargetRef.current.lat = lat
        if (typeof heading === 'number' && !isNaN(heading)) markerTargetRef.current.heading = heading
      }
    window.__rahalStopSim = () => {
      if (window.__rahalSimTimer) {
        clearInterval(window.__rahalSimTimer)
        window.__rahalSimTimer = null
      }
    }
  }
}, [mapReady])
useEffect(() => {
  if (!mapReady) return
  const map = mapRef.current
  if (map) {
    const onStart = () => { isDraggingRef.current = true }
    const onManualStart = () => {
      onStart()
      if (tripActiveRef.current && followLockRef.current) {
        followLockRef.current = false
        setFollowLocked(false)
        try { map.touchPitch.enable() } catch { /* noop */ }
        try { map.touchZoomRotate.enableRotation() } catch { /* noop */ }
      }
    }
    const onEnd = () => { isDraggingRef.current = false }
    map.on('dragstart', onManualStart)
    map.on('dragend', onEnd)
    map.on('rotatestart', onManualStart)
    map.on('rotateend', onEnd)
    map.on('pitchstart', onManualStart)
    map.on('pitchend', onEnd)
    const canvas = map.getCanvas()
    canvas.addEventListener('pointerdown', onStart)
    canvas.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
  }
  let rafId
  const step = () => {
    const m = markerRef.current
    const tgt = markerTargetRef.current
    const sm = markerSmoothRef.current
    if (m && typeof tgt.lng === 'number' && typeof tgt.lat === 'number' && !isNaN(tgt.lng) && !isNaN(tgt.lat)) {
      if (sm.lng === null) { sm.lng = tgt.lng; sm.lat = tgt.lat; sm.heading = tgt.heading || 0 }
      const positionK = 0.18
      const headingK = 0.15
      sm.lng += (tgt.lng - sm.lng) * positionK
      sm.lat += (tgt.lat - sm.lat) * positionK
      if (typeof tgt.heading === 'number' && Number.isFinite(tgt.heading)) {
        const dh = ((tgt.heading - sm.heading + 540) % 360) - 180
        if (Math.abs(dh) >= 2.0) {
          sm.heading = (sm.heading + dh * headingK + 360) % 360
        }
      }
      m.setLngLat([sm.lng, sm.lat])
    }
    rafId = requestAnimationFrame(step)
  }
  rafId = requestAnimationFrame(step)
  return () => cancelAnimationFrame(rafId)
}, [mapReady])
const warnedStepsRef = useRef(new Set());
  const warnedReportsRef = useRef(new Set());
  const lastSpeedWarningRef = useRef(0);

  const nextStep = useMemo(() => {
    if (!location || !routeInfo || !routeInfo.steps) return null
    const steps = routeInfo.steps
    if (steps.length === 0) return null

    let nearestIdx = 0
    let minD = Infinity
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      if (!s.location) continue
      const d = metersBetween(location, s.location)
      if (d < minD) { minD = d; nearestIdx = i }
    }

    let aheadIdx = nearestIdx
    if (aheadIdx < steps.length - 1) aheadIdx = aheadIdx + 1

    const step = steps[aheadIdx]
    let remainingDist = 0
    let remainingDur = 0
    for (let i = aheadIdx; i < steps.length; i++) {
      remainingDist += steps[i].distance || 0
      remainingDur += steps[i].duration || 0
    }

    return {
      index: aheadIdx,
      instruction: step.instruction,
      distanceToStep: step.location ? metersBetween(location, step.location) : 0,
      remainingDistance: remainingDist,
      remainingDuration: remainingDur,
      isArrival: step.type === 'arrive',
    }
  }, [location, routeInfo])

  // إعادة تصفير التنبيهات عند بدء رحلة جديدة
  useEffect(() => {
    if (tripActive) {
      warnedStepsRef.current.clear();
      warnedReportsRef.current.clear();
      lastSpeedWarningRef.current = 0;
    }
  }, [tripActive])

  // 0. النافذة العائمة (Waze Popup)
  useEffect(() => {
    if (!tripActive) { setActiveAlert(null); return; }
    
    // فحص العوائق
    if (location && reports.length > 0) {
      for (const r of reports) {
        if (r.resolvedAt) continue;
        const d = metersBetween(location, r);
        if (d < 250 && d > 30) {
          if (!triggeredAlertsRef.current.has(r.id)) {
            triggeredAlertsRef.current.add(r.id);
            const t = getReportType(r.type);
            const isCamera = r.type === 'camera' || r.type === 'checkpoint';
            setActiveAlert({ 
              title: t.label, 
              subtitle: isCamera ? 'كاميرا مراقبة سرعة' : 'انتبه أمامك ' + t.label, 
              distance: Math.round(d/10)*10,
              isCamera
            });
          }
          break;
        }
      }
    }
    
    // فحص الانعطافات (تظهر النافذة عندما تكون المسافة 300 متر)
    if (nextStep && nextStep.distanceToStep && nextStep.distanceToStep < 300) {
       const stepId = 'step_ui_' + nextStep.index;
       if (!triggeredAlertsRef.current.has(stepId)) {
           triggeredAlertsRef.current.add(stepId);
           let dir = 'straight';
           const instr = nextStep.instruction || '';
           if (instr.includes('يمين')) dir = 'right';
           else if (instr.includes('يسار')) dir = 'left';
           setActiveAlert({ title: 'توجيه', subtitle: nextStep.instruction, distance: Math.round(nextStep.distanceToStep), direction: dir });
       }
    }
  }, [location, reports, nextStep, tripActive]);

  // 1. تنبيهات الانعطاف
  useEffect(() => {
    if (!tripActive || !nextStep || nextStep.isArrival) return
    const dist = nextStep.distanceToStep
    if (dist > 0) {
      const stepId = 'step_' + nextStep.index
      let text = ''
      if (dist <= 50 && !warnedStepsRef.current.has(stepId + '_50')) {
        warnedStepsRef.current.add(stepId + '_50')
        text = 'الآن، ' + nextStep.instruction
      } else if (dist <= 300 && !warnedStepsRef.current.has(stepId + '_300')) {
        warnedStepsRef.current.add(stepId + '_300')
        text = 'بعد 300 متر، ' + nextStep.instruction
      }
      if (text) speakArabic(text)
    }
  }, [nextStep, tripActive])

  // 2. تنبيهات العوائق (مطبات، كاميرات، إلخ)
  useEffect(() => {
    if (!tripActive || !location) return
    for (const r of reports) {
      if (r.resolvedAt || (r.expiresAt && r.expiresAt < Date.now())) continue
      const d = metersBetween(location, r)
      if (d < 250 && d > 50) {
        const repId = 'rep_' + r.id
        if (!warnedReportsRef.current.has(repId)) {
          warnedReportsRef.current.add(repId)
          const t = getReportType(r.type)
          if (t) speakArabic('انتبه، أمامك ' + t.label + ' بعد ' + Math.round(d/50)*50 + ' متر')
          break
        }
      }
    }
  }, [location, reports, tripActive])

  // 3. تنبيهات السرعة
  useEffect(() => {
    if (!tripActive || !location || !location.speed) return
    const speedKmh = location.speed * 3.6
    const limit = 80 // يمكن تعديلها حسب المنطقة
    if (speedKmh > limit + 5) {
      const now = Date.now()
      if (now - lastSpeedWarningRef.current > 20000) {
        lastSpeedWarningRef.current = now
        speakArabic('تجاوزت السرعة المقررة ' + limit + ' كم/س، خفف السرعة')
      }
    }
  }, [location, tripActive])

  const nextStepRef = useRef(null);
  useEffect(() => { nextStepRef.current = nextStep; }, [nextStep]);

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const t = setTimeout(() => {
      try { map.resize() } catch { /* noop */ }
    }, 60)
    return () => clearTimeout(t)
  }, [tripActive])

  useEffect(() => {
    if (!tripActive || !nextStep) return
    if (nextStep.isArrival) return
    if (nextStep.distanceToStep >= 500) return
    if (nextStep.distanceToStep < VOICE_THRESHOLD_METERS) return
    if (spokenStepsRef.current.has(nextStep.index)) return
    const expected = spokenDistancePhrase(VOICE_THRESHOLD_METERS) + '\u060C ' + nextStep.instruction
    prefetchArabic(expected).catch(() => {})
  }, [tripActive, nextStep])

  useEffect(() => {
    if (!tripActive || !nextStep) return
    if (nextStep.isArrival) {
      if (nextStep.distanceToStep < 60 && !arrivalSpokenRef.current) {
        arrivalSpokenRef.current = true
        speakArabic(UI_TEXT.arrival)
        setTripActive(false)
      }
      return
    }
    if (nextStep.distanceToStep < VOICE_THRESHOLD_METERS && !spokenStepsRef.current.has(nextStep.index)) {
      spokenStepsRef.current.add(nextStep.index)
      const text = spokenDistancePhrase(nextStep.distanceToStep) + '\u060C ' + nextStep.instruction
      speakArabic(text)
    }
  }, [tripActive, nextStep])


  const [arrivalTimeText, setArrivalTimeText] = useState('--:--')

  useEffect(() => {
    const compute = () => {
      if (!tripActive || !nextStep || !nextStep.remainingDuration) {
        setArrivalTimeText('--:--')
        return
      }
      const t = new Date(Date.now() + nextStep.remainingDuration * 1000)
      setArrivalTimeText(t.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    compute() // تشغيل فوري عند بدء الرحلة
    const id = setInterval(compute, 30000)
    return () => clearInterval(id)
  }, [tripActive, nextStep])

  return (
    <main className={"rahal-app" + (tripActive ? " nav-mode" : "") + (tripActive && activeTab !== "home" ? " nav-report" : "")} dir="rtl">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}><img src="/logo-rah-new.png" alt="رحال" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
          <div>
            <strong>{UI_TEXT.brand}</strong>
            <span>{UI_TEXT.subtitle}</span>
          </div>
        </div>
        <button className="location-btn" type="button" onClick={goToUser}>
          {UI_TEXT.myLocation}
        </button>
        <button
          className="compass-btn"
          type="button"
          aria-label="إعادة التوجيه"
          onClick={() => {
            const m = mapRef.current;
            if (!m) return;
            let h = 0;
            if (location && typeof location.heading === 'number' && !isNaN(location.heading)) h = location.heading;
            else if (destinationRef.current && location) {
              const dLat = destinationRef.current.lat - location.lat;
              const dLng = (destinationRef.current.lng - location.lng) * Math.cos(location.lat * Math.PI / 180);
              if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) h = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
            }
            m.easeTo({ pitch: 60, bearing: h, duration: 600, essential: true });
          }}
        >
          <img src="/icons/recenter.png" alt="إعادة التوجيه" />
        </button>
      
        <div className="user-stats-badge" title="مستواك ونقاطك">
          <span className="stats-level">{getLevelName(userStats.level)}</span>
          <span className="stats-points">{userStats.points} <small>نقطة</small></span>
        </div>
</header>

      <div className={'home-view' + (activeTab === 'home' ? '' : ' hidden')}>
        <section className="search-section">
          <div className="search-box">
            <span>{'\u2315'}</span>
            <input
              type="text"
              placeholder={UI_TEXT.searchPlaceholder}
              aria-label={UI_TEXT.searchLabel}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); if (tripActive && !typingWarnedRef.current) { typingWarnedRef.current = true; speakArabic('\u062A\u062D\u0630\u064A\u0631\u060C \u0644\u0627 \u062A\u0643\u062A\u0628 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0642\u064A\u0627\u062F\u0629'); setTimeout(() => { typingWarnedRef.current = false }, 10000) } }}
              onFocus={() => setShowResults(true)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                aria-label={UI_TEXT.searchClear}
                onClick={handleClearSearch}
              >
                {UI_TEXT.clearIcon}
              </button>
            )}
          </div>

          {showResults && !searchActive && searchHistory.length > 0 && (
            <div className="search-results">
              <div className="search-status search-recent">{UI_TEXT.searchRecent}</div>
              {searchHistory.map((h, i) => (
                <div key={'hist-' + i} className="search-result-row">
                  <button
                    type="button"
                    className="search-result-main"
                    onClick={() => handleSelectResult({ id: 'hist-' + i, name: h.name, fullName: h.fullName, lat: h.lat, lng: h.lng })}
                  >
                    <strong>{h.name}</strong>
                    <span>{h.fullName}</span>
                  </button>
                  <button
                    type="button"
                    className="search-result-remove"
                    aria-label={'\u062D\u0630\u0641'}
                    onClick={(e) => { e.stopPropagation(); handleRemoveHistoryItem(h) }}
                  >
                    {'\u00D7'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {showResults && searchActive && (
            <div className="search-results">
              {searchStatus === 'loading' && (
                <div className="search-status">{UI_TEXT.searchLoading}</div>
              )}
              {searchStatus === 'empty' && (
                <div className="search-status">{UI_TEXT.searchNoResults}</div>
              )}
              {searchStatus === 'error' && (
                <div className="search-status search-error-text">{UI_TEXT.searchError}</div>
              )}
              {searchStatus === 'done' && searchResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="search-result"
                  onClick={() => handleSelectResult(r)}
                >
                  <strong>{r.name}</strong>
                  {r.fullName !== r.name && <span>{r.fullName}</span>}
                </button>
              ))}
            </div>
          )}

          {showCategories && (
            <div className="category-picker">
              <div className="category-header">
                <span>{UI_TEXT.nearbyPickCategory}</span>
                <button type="button" className="category-close" onClick={handleCloseCategories}>
                  {UI_TEXT.nearbyClose}
                </button>
              </div>
              <div className="category-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="category-btn"
                    onClick={() => handlePickCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="quick-actions">
            <button type="button" onClick={handleGoHome}>{UI_TEXT.home}</button>
            <button type="button" onClick={handleGoWork}>{UI_TEXT.work}</button>
            <button type="button" onClick={handleNearby}>{UI_TEXT.nearby}</button>
          </div>
        </section>

        <section className="map-area" aria-label={UI_TEXT.mapLabel}>
          {!tripActive && <div className={statusClass} role="status">{statusLabel}</div>}

          
        <div ref={containerRef} className="rahal-map" />
        
        {/* ===== WAZE ALERT POPUP ===== */}
        {activeAlert && (
          <div className="waze-alert-popup">
            <div className={`waze-alert-box ${activeAlert.isCamera ? 'radar-mode' : ''}`}>
              <div className="waze-alert-icon-wrapper">
                <div className="waze-alert-pulse"></div>
                {activeAlert.isCamera ? (
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400/80 radar-pulse-ring-1 pointer-events-none" />
                    <span className="absolute inset-0 rounded-2xl border border-cyan-300/60 radar-pulse-ring-2 pointer-events-none" />
                    <span className="absolute inset-0 rounded-2xl border border-cyan-500/40 radar-pulse-ring-3 pointer-events-none" />
                    <div className="relative w-13 h-13 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 border border-cyan-400/90 shadow-[inset_0_0_12px_rgba(6,182,212,0.4)] flex items-center justify-center">
                      <div className="absolute inset-[-40%] radar-sweep-beam pointer-events-none opacity-80" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(34, 211, 238, 0.25) 320deg, rgba(34, 211, 238, 0.9) 360deg)' }} />
                      <div className="absolute inset-1 rounded-xl border border-cyan-400/25 pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                        <div className="w-full h-px bg-cyan-400" />
                        <div className="h-full w-px bg-cyan-400 absolute" />
                      </div>
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] stroke-white stroke-[1.8]">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" fill="rgba(6,182,212,0.3)" />
                          <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="absolute top-[9px] w-2 h-2 rounded-full bg-cyan-300 radar-lens-flash shadow-[0_0_10px_#22d3ee]" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 z-20 w-5 h-5 rounded-full bg-white border-2 border-red-600 flex items-center justify-center shadow-md">
                      <span className="text-[9px] font-black font-mono text-black leading-none">50</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-300/80 text-white shrink-0">
                    <span className="absolute inset-0 rounded-2xl border-2 border-amber-400/70 radar-pulse-ring-1 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-center w-full h-full">
                      {activeAlert.direction === 'left' && (
                        <svg viewBox="0 0 36 36" fill="none" width="32" height="32" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                          <path d="M 28 32 L 28 16 C 28 10, 24 6, 17 6 L 10 6" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                          <polyline points="14 1 8 6 14 11" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {activeAlert.direction === 'right' && (
                        <svg viewBox="0 0 36 36" fill="none" width="32" height="32" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                          <path d="M 8 32 L 8 16 C 8 10, 12 6, 19 6 L 26 6" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                          <polyline points="22 1 28 6 22 11" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {(!activeAlert.direction || activeAlert.direction === 'straight') && (
                        <svg viewBox="0 0 36 36" fill="none" width="32" height="32" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                          <path d="M 18 32 L 18 10" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                          <polyline points="12 16 18 10 24 16" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="waze-alert-content">
                <div className="waze-alert-title">
                  {activeAlert.title}
                  <span className="waze-alert-distance">بعد {activeAlert.distance} م</span>
                </div>
                <div className="waze-alert-subtitle">{activeAlert.subtitle}</div>
              </div>
              <button className="waze-alert-close" onClick={() => setActiveAlert(null)}>✕</button>
            </div>
          </div>
        )}

        {/* ===== WAZE HUD OVERLAY ===== */}
        {tripActive && (
          <div className="waze-hud-container">
            {/* الشريط الأسود العلوي */}
            <div className="waze-top-bar">
              <div className="waze-turn-info">
                <div style={{ fontSize: '32px' }}>↰</div>
                <div>
                  <div className="waze-distance">
                    {nextStep ? formatDistanceArabic(nextStep.distanceToStep) : '0 م'}
                  </div>
                  <div className="waze-instruction">
                    {nextStep ? nextStep.instruction : 'جاري التحميل...'}
                  </div>
                </div>
              </div>
              <button className="waze-exit-btn" onClick={stopTrip}>خروج</button>
            </div>

            {/* المنطقة السفلية */}
            <div className="waze-bottom-area">
              <div className="waze-floating-actions">
                <div className="waze-speedometer">
                  <span className="waze-speedometer-val">{Math.round((location?.speed || 0) * 3.6)}</span>
                  <span className="waze-speedometer-unit">كم/س</span>
                </div>
                <button className="waze-report-btn" onClick={() => setActiveTab('report')} title="تسجيل بلاغ ملاحي حي">
                  <img src="/report-icon.webp" alt="أيقونة بلاغات رحال" />
                </button>
              </div>
              
              <div className="waze-eta-sheet">
                <div style={{ textAlign: 'center' }}>
                  <div id="waze-eta-time" className="waze-eta-time">{arrivalTimeText}</div>
                  <div id="waze-eta-details" className="waze-eta-details">
                    {nextStep ? formatDistanceArabic(nextStep.remainingDistance) : ''} · {nextStep ? formatDurationArabic(nextStep.remainingDuration) : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {mapError && <div className="map-error">{mapError}</div>}
          <div className="map-controls">
            <button type="button" aria-label={UI_TEXT.zoomIn} onClick={zoomIn}>+</button>
            <button type="button" aria-label={UI_TEXT.zoomOut} onClick={zoomOut}>-</button>
            <button type="button" className={"mic-btn" + (isMicListening ? " mic-active" : "")} aria-label="الأوامر الصوتية" onClick={handleVoiceClick}>{isMicListening ? "…" : <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/><path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}</button>
            <button
              type="button"
              className="map-location-control"
              aria-label={UI_TEXT.locate}
              onClick={goToUser}
            >
              {'\u2316'}
            </button>
          </div>
        </section>

        {tripActive && nextStep && !nextStep.isArrival && (
          <div className="nav-waze-top">
            <div className="nav-waze-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 20V10a4 4 0 0 1 4-4h6" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 3 19 6 16 9" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="nav-waze-info">
              <div className="nav-waze-distance">{formatDistanceArabic(nextStep.distanceToStep)}</div>
              <div className="nav-waze-street">{nextStep.instruction}</div>
            </div>
            <button
              type="button"
              className={'nav-waze-recenter' + (followLocked ? ' is-locked' : '')}
              onClick={() => {
                const m = mapRef.current;
                if (!m) return;
                if (followLockRef.current) {
                  followLockRef.current = false;
                  setFollowLocked(false);
                  try { m.dragPan.enable(); } catch { /* noop */ }
                  try { m.touchPitch.enable(); } catch { /* noop */ }
                  try { m.touchZoomRotate.enableRotation(); } catch { /* noop */ }
                  try { m.stop(); } catch { /* noop */ }
                  try { m.setPitch(0); } catch { /* noop */ }
                } else {
                  try { m.dragPan.enable(); } catch { /* noop */ }
                  try { m.touchPitch.disable(); } catch { /* noop */ }
                  try { m.touchZoomRotate.disableRotation(); } catch { /* noop */ }
                  followLockRef.current = true;
                  setFollowLocked(true);
                  const smc = markerSmoothRef.current;
                  const tgt = markerTargetRef.current;
                  if (smc && tgt) {
                    if (typeof tgt.lng === 'number' && !isNaN(tgt.lng)) smc.lng = tgt.lng;
                    if (typeof tgt.lat === 'number' && !isNaN(tgt.lat)) smc.lat = tgt.lat;
                    if (typeof tgt.heading === 'number' && !isNaN(tgt.heading)) smc.heading = tgt.heading;
                  }
                  try { m.stop(); } catch { /* noop */ }
                  try { m.setPitch(60); } catch { /* noop */ }
                }
              }}
              aria-label={followLocked ? 'إلغاء التثبيت' : 'تثبيت الكاميرا خلف السهم'}
              title={followLocked ? 'إلغاء التثبيت' : 'تثبيت الكاميرا خلف السهم'}
            >
              <img src="/icons/recenter.png" alt="" />
            </button>
            <button type="button" className="nav-waze-exit" onClick={stopTrip} aria-label="{'\u0625\u064A\u0642\u0627\u0641'}"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L18 18M6 18L18 6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
          </div>
        )}

        {tripActive && (
          <div className="nav-waze-speed">
            <div className="nav-waze-speed-value">{Math.round((location && location.speed ? location.speed : 0) * 3.6)}</div>
            <div className="nav-waze-speed-unit">{'\u0643\u0645/\u0633'}</div>
          </div>
        )}

        {tripActive && (
          <button type="button" className="nav-waze-fab" onClick={() => setActiveTab('report')} aria-label="{'\u0625\u0628\u0644\u0627\u063A'}">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L22 20H2L12 3Z" fill="#1f2937"/>
              <path d="M12 9V14" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="1.3" fill="#fbbf24"/>
            </svg>
          </button>
        )}

        {tripActive && (
          <div className="nav-waze-sheet">
            <div className="nav-waze-handle"></div>
            {arrivalTimeText && arrivalTimeText !== '--:--' && (<div className="nav-waze-time">{arrivalTimeText}</div>)}
            <div className="nav-waze-meta">
              <span>{nextStep ? formatDistanceArabic(nextStep.remainingDistance) : '\u2014'}</span>
              
              <span>{nextStep ? formatDurationArabic(nextStep.remainingDuration) : '\u2014'}</span>
            </div>
          </div>
        )}

        

        {routeStatus !== 'idle' && (
          <section className="eta-section">
            {routeStatus === 'loading' && (
              <div className="eta-banner eta-loading" role="status">{UI_TEXT.routingLoading}</div>
            )}
            {routeStatus === 'error' && (
              <div className="eta-banner eta-error" role="status">{UI_TEXT.routingError}</div>
            )}
            {routeStatus === 'done' && nextStep && (
              <div className="eta-banner" role="status">
                <div className="eta-main">
                  <span className="eta-distance">{formatDistanceArabic(nextStep.remainingDistance)}</span>
                  
                  <span className="eta-duration">{formatDurationArabic(nextStep.remainingDuration)}</span>
                </div>
                <div className="eta-next">
                  <span className="eta-next-label">
                    {nextStep.isArrival ? UI_TEXT.arrival : nextStep.instruction}
                  </span>
                  {!nextStep.isArrival && (
                    <span className="eta-next-dist">
                      {UI_TEXT.nextStepAfter + ' ' + formatDistanceArabic(nextStep.distanceToStep)}
                    </span>
                  )}
                </div>
                <div className="eta-actions">
                  {!tripActive ? (
                    <button type="button" className="trip-btn trip-start" onClick={startTrip}>
                      {UI_TEXT.startTrip}
                    </button>
                  ) : (
                    <button type="button" className="trip-btn trip-stop" onClick={stopTrip}>
                      {UI_TEXT.stopTrip}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        
        {showPointsPopup && (
          <div className="points-popup-glow">
            <div className="popup-content">
              <span className="popup-star">⭐</span>
              <div className="popup-info">
                <strong>+3 نقاط</strong>
                <small>شكراً لتنبيه الطريق</small>
              </div>
            </div>
          </div>
        )}

        {nearbyReport && (() => {
          const t = getReportType(nearbyReport.type)
          if (!t) return null
          const dist = location ? Math.round(metersBetween(location, nearbyReport)) : 0
          return (
            <section className="nearby-alert">
              <div className="nearby-alert-icon">
                <img src={t.iconPath} alt={t.label} />
              </div>
              <div className="nearby-alert-body">
                <strong>{t.label}</strong>
                <span>{formatDistanceArabic(dist) + ' ' + (UI_TEXT.nearbyAlertFrom || '')}</span>
              </div>
              <div className="nearby-alert-actions">
                <button
                  type="button"
                  className="nearby-alert-confirm"
                  onClick={() => handleConfirmNearby(nearbyReport)}
                >
                  {'\u0646\u0639\u0645 \u0645\u0627\u0632\u0627\u0644'}
                </button>
                <button
                  type="button"
                  className="nearby-alert-resolve"
                  onClick={() => handleResolveNearby(nearbyReport)}
                >
                  {UI_TEXT.nearbyGone}
                </button>
                <button
                  type="button"
                  className="nearby-alert-dismiss"
                  onClick={() => handleDismissNearby(nearbyReport)}
                  aria-label="\u0625\u063A\u0644\u0627\u0642"
                >
                  {'\u00D7'}
                </button>
              </div>
            </section>
          )
        })()}
        <section className="report-panel">
          <div>
            <strong>{UI_TEXT.roadReportTitle}</strong>
            <span>{UI_TEXT.roadReportSubtitle}</span>
          </div>
          <button
            type="button"
            className="report-open-btn"
            onClick={() => setActiveTab('report')}
          >
            {UI_TEXT.reportOpen}
          </button>
        </section>


      </div>

      {activeTab === 'saved' && (
        <section className="view-panel" aria-label={UI_TEXT.saved}>
          <div className="view-header">
            <h2>{UI_TEXT.saved}</h2>
            {searchHistory.length > 0 && (
              <button type="button" className="view-clear" onClick={handleClearHistory}>
                {UI_TEXT.savedClear}
              </button>
            )}
          </div>
          {searchHistory.length === 0 ? (
            <div className="view-placeholder">
              <p>{UI_TEXT.savedEmpty}</p>
            </div>
          ) : (
            <div className="saved-list">
              {searchHistory.map((h, i) => (
                <div key={'saved-' + i} className="saved-item">
                  <button
                    type="button"
                    className="saved-item-main"
                    onClick={() => { setActiveTab('home'); handleSelectResult({ id: 'saved-' + i, name: h.name, fullName: h.fullName, lat: h.lat, lng: h.lng }) }}
                  >
                    <strong>{h.name}</strong>
                    <span>{h.fullName}</span>
                  </button>
                  <button
                    type="button"
                    className="saved-item-remove"
                    aria-label={'\u062D\u0630\u0641'}
                    onClick={() => handleRemoveHistoryItem(h)}
                  >
                    {'\u00D7'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'report' && (
        <section className="view-panel" aria-label={UI_TEXT.reportOpen}>
          <div className="view-header">
            <h2>{UI_TEXT.reportPickType}</h2>
            {tripActive && (
              <button type="button" className="view-clear" onClick={() => setActiveTab('home')}>{'\u0631\u062C\u0648\u0639 \u0644\u0644\u0645\u0644\u0627\u062D\u0629'}</button>
            )}
          </div>
          <div className="report-picker-grid-page">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="report-picker-item"
                onClick={() => {
                  handleAddReport(t.id)
                  setActiveTab('home')
                }}
              >
                <img src={t.iconPath} alt={t.label} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'places' && (
        <section className="view-panel" aria-label={UI_TEXT.places} key={'places-' + homeVersion}>
          <div className="view-header">
            <h2>{UI_TEXT.places}</h2>
          </div>
          <div className="saved-list">
            <div className="saved-item">
              <div className="saved-item-main">
                <strong>{UI_TEXT.home}</strong>
                <span>{homePlace ? homePlace.name : UI_TEXT.homeNotSet}</span>
              </div>
              <button
                type="button"
                className="saved-item-remove"
                onClick={homePlace ? handleClearHome : handleSaveHome}
              >
                {homePlace ? UI_TEXT.clearHome : UI_TEXT.setHome}
              </button>
            </div>
            <div className="saved-item">
              <div className="saved-item-main">
                <strong>{UI_TEXT.work}</strong>
                <span>{workPlace ? workPlace.name : UI_TEXT.workNotSet}</span>
              </div>
              <button
                type="button"
                className="saved-item-remove"
                onClick={workPlace ? handleClearWork : handleSaveWork}
              >
                {workPlace ? UI_TEXT.clearWork : UI_TEXT.setWork}
              </button>
            </div>
            {!homePlace && !workPlace && (
              <div className="view-placeholder">
                <p>{UI_TEXT.placesEmpty}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="view-panel" aria-label={UI_TEXT.more}>
          <div className="view-header">
            <h2>{UI_TEXT.settingsTitle}</h2>
          </div>
          <div className="saved-list">
            <div className="settings-section">
              <h3>{UI_TEXT.settingsMapSection}</h3>
              <p>{UI_TEXT.subtitle}</p>
            </div>
            <div className="settings-section">
              <h3>{UI_TEXT.settingsPlacesSection}</h3>
              <div className="settings-row">
                <span>{UI_TEXT.home}: {homePlace ? homePlace.name : UI_TEXT.homeNotSet}</span>
                <button type="button" className="settings-btn" onClick={homePlace ? handleClearHome : handleSaveHome}>
                  {homePlace ? UI_TEXT.clearHome : UI_TEXT.setHome}
                </button>
              </div>
              <div className="settings-row">
                <span>{UI_TEXT.work}: {workPlace ? workPlace.name : UI_TEXT.workNotSet}</span>
                <button type="button" className="settings-btn" onClick={workPlace ? handleClearWork : handleSaveWork}>
                  {workPlace ? UI_TEXT.clearWork : UI_TEXT.setWork}
                </button>
              </div>
            </div>
            <div className="settings-section">
              <h3>{UI_TEXT.settingsAboutSection}</h3>
              <p>{UI_TEXT.settingsAboutText}</p>
            </div>
          </div>
        </section>
      )}

      <nav className="bottom-nav" aria-label={UI_TEXT.navigation}>
        <button type="button" className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          <span>{'\u2302'}</span>
          <small>{UI_TEXT.main}</small>
        </button>
        <button type="button" className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>
          <span>{'\u2605'}</span>
          <small>{UI_TEXT.saved}</small>
        </button>
        <button type="button" className={activeTab === 'places' ? 'active' : ''} onClick={() => setActiveTab('places')}>
          <span>{'\u2316'}</span>
          <small>{UI_TEXT.places}</small>
        </button>
        <button type="button" className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          <span>{'\u2630'}</span>
          <small>{UI_TEXT.more}</small>
        </button>
      </nav>
    </main>
  )
}

export default App




















