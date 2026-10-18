import fs from 'fs';

// ===== 1. إعادة كتابة voiceControl.js من الصفر =====
const vcContent = `import { speakArabicViaServer, stopSpeaking } from './tts.js'

const SR = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = null
let isListening = false
let micWindowTimer = null
let silenceTimer = null
let accumText = ''
let lastCommandAt = 0
let isRanaSpeaking = false

const MIC_WINDOW_MS = 15000
const SILENCE_MS = 800
const COOLDOWN_MS = 2000

async function say(text) {
  isRanaSpeaking = true
  try { await speakArabicViaServer(text) } catch { /* noop */ }
  setTimeout(() => { isRanaSpeaking = false }, 2000)
}

function clearTimers() {
  if (micWindowTimer) { clearTimeout(micWindowTimer); micWindowTimer = null }
  if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null }
}

function safeStart() { try { recognition.start() } catch { /* noop */ } }
function safeStop() { try { recognition.stop() } catch { /* noop */ } }

export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch, onStateChange }) {
  if (!SR) { say('محرك الأوامر الصوتية غير مدعوم'); return }

  if (isListening) {
    clearTimers()
    safeStop()
    isListening = false
    if (onStateChange) onStateChange(false)
    return
  }

  recognition = new SR()
  recognition.lang = 'ar-SA'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  isListening = true
  accumText = ''
  if (onStateChange) onStateChange(true)

  stopSpeaking()
  say('أهلا بك')

  setTimeout(() => { if (isListening) safeStart() }, 1200)

  micWindowTimer = setTimeout(() => {
    console.log('MIC_WINDOW_CLOSED')
    clearTimers()
    safeStop()
    isListening = false
    if (onStateChange) onStateChange(false)
  }, MIC_WINDOW_MS)

  recognition.onresult = function (event) {
    if (isRanaSpeaking) { return }
    let latest = ''
    for (let i = event.results.length - 1; i >= 0; i--) {
      const r = event.results[i]
      if (r[0] && r[0].transcript) { latest = r[0].transcript.trim(); break }
    }
    if (!latest) return
    accumText = latest
    console.log('VOICE_PARTIAL:', accumText)
    if (silenceTimer) clearTimeout(silenceTimer)
    silenceTimer = setTimeout(() => {
      const speechText = accumText.trim().toLowerCase()
      accumText = ''
      if (!speechText) return
      const now = Date.now()
      if (now - lastCommandAt < COOLDOWN_MS) return
      lastCommandAt = now
      console.log('VOICE_FINAL:', speechText)
      executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch })
    }, SILENCE_MS)
  }

  recognition.onerror = function (event) {
    console.error('VOICE_ERR:', event.error)
    if (!isListening) return
    if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'audio-capture') {
      setTimeout(() => { if (isListening) safeStart() }, 300)
    }
  }

  recognition.onend = function () {
    if (!isListening) return
    setTimeout(() => { if (isListening) safeStart() }, 300)
  }
}

async function executeVoiceCommand(text, ctx) {
  const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx
  const map = getMap ? getMap() : null
  console.log('DEBUG_EXEC:', JSON.stringify(text), '| tripActive:', tripActive);

  if (text.includes('الغاء') || text.includes('الغي') || text.includes('الغى') || text.includes('الغ') || text.includes('وقف') || text.includes('وكف') || text.includes('انهي') || text.includes('خلاص') || text.includes('كنسل')) {
    console.log('CANCEL_TRIP_TRIGGERED:', text);
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      setTimeout(() => { say('تم إلغاء الرحلة'); }, 1200);
    }
    return;
  }

  if (text.includes('ابدا') || text.includes('ابدأ') || text.includes('الرحله') || text.includes('الرحلة') || text.includes('يلا') || text.includes('مشينا')) {
    if (!hasRoute) { say('حدد وجهة أولاً'); return }
    if (typeof onStartTrip === 'function') { onStartTrip(); }
    return;
  }

  if (text.includes('اعدادات')) { setActiveTab('settings'); say('فتحت الإعدادات'); return }
  if (text.includes('محفوظة')) { setActiveTab('saved'); say('المحفوظة'); return }
  if (text.includes('رئيسية') || text.includes('خريطة')) { setActiveTab('home'); return }

  if (map) {
    if (text.includes('قرب')) { map.zoomTo(map.getZoom() + 1); return }
    if (text.includes('بعد') && !text.includes('متر') && !text.includes('مسافة')) { map.zoomTo(map.getZoom() - 1); return }
  }

  let type = null
  let msg = ''
  if (text.includes('سيطر') || text.includes('تفتيش')) { type = 'checkpoint'; msg = 'تم تسجيل نقطة تفتيش' }
  else if (text.includes('حادث') || text.includes('دعمية')) { type = 'accident'; msg = 'تم الإبلاغ عن حادث' }
  else if (text.includes('مطب') || text.includes('طسة')) { type = 'speed_bump'; msg = 'تمت إضافة مطب' }
  else if (text.includes('ازدحام')) { type = 'traffic'; msg = 'تم تسجيل ازدحام' }
  else if (text.includes('كامير') || text.includes('رادار')) { type = 'camera'; msg = 'تنبيه، رادار' }
  else if (text.includes('طوار') || text.includes('عاطل')) { type = 'emergency'; msg = 'طوارئ' }
  else if (text.includes('حيوان') || text.includes('بقر')) { type = 'animals'; msg = 'حيوانات على الطريق' }
  else if (text.includes('طقس') || text.includes('مطر')) { type = 'bad_weather'; msg = 'طقس سيئ' }
  else if (text.includes('اعمال')) { type = 'road_work'; msg = 'أعمال على الطريق' }
  else if (text.includes('مسدود') || text.includes('مغلق') || text.includes('خطر')) { type = 'hazard'; msg = 'عائق في الطريق' }
  else if (text.includes('وقود') || text.includes('بنزين')) { type = 'fuel'; msg = 'محطة وقود' }

  if (type) {
    if (typeof submitReport === 'function') {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          try { await submitReport(type, gps); say(msg); } catch (e) { say('فشل التسجيل'); }
        },
        () => {
          if (map) {
            const c = map.getCenter()
            submitReport(type, { lat: c.lat, lng: c.lng }).then(() => say(msg)).catch(() => say('فشل'))
          }
        },
        { enableHighAccuracy: false, timeout: 8000 }
      )
    }
    return
  }
  say('لم أفهم')
}
`;
fs.writeFileSync('D:/RAHAL/src/lib/voiceControl.js', vcContent, 'utf8');
console.log('VOICE_CONTROL: REWRITTEN');

// ===== 2. إصلاح بدء الرحلة في App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
const startTripRegex = /const startTrip = useCallback\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\)/;
const newStartTrip = `const startTrip = useCallback(() => {
    if (!routeInfo) return
    setTripActive(true)
    speakArabic('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')
    typingWarnedRef.current = false
    spokenStepsRef.current = new Set()
    arrivalSpokenRef.current = false
    const dest = destinationRef.current
    if (dest && location) {
      getRoute(
        { lat: location.lat, lng: location.lng },
        { lat: dest.lat, lng: dest.lng },
      ).then((route) => { if (route) applyRoute(route) }).catch(() => {})
    }
    const startMap = mapRef.current
    if (startMap && location) {
      let h = null
      if (typeof location.heading === 'number' && !isNaN(location.heading)) h = location.heading
      else if (routeInfo && routeInfo.steps && routeInfo.steps.length > 0) {
        const firstStep = routeInfo.steps[0]
        if (firstStep.location) {
          const dLat = firstStep.location.lat - location.lat
          const dLng = (firstStep.location.lng - location.lng) * Math.cos(location.lat * Math.PI / 180)
          if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) {
            h = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360
          }
        }
      }
      if (h === null) h = 0
      startMap.easeTo({
        center: [location.lng, location.lat],
        zoom: 17,
        pitch: 60,
        bearing: h,
        padding: { top: 0, bottom: Math.round((startMap.getContainer().clientHeight || 600) * 0.32), left: 0, right: 0 },
        duration: 900,
        essential: true,
      })
    }
  }, [routeInfo, location, applyRoute])`;
if (startTripRegex.test(app)) {
  app = app.replace(startTripRegex, newStartTrip);
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP: START TRIP REWRITTEN');
}