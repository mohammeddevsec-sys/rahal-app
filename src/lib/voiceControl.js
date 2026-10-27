// Rahal Voice Control v2 - Clean robust version
// Web Speech API + Rana TTS + reports backend

import { speakArabicViaServer, stopSpeaking } from './tts.js'
import { formatDistanceArabic, formatDurationArabic } from './routing.js'
import { reverseGeocode } from './nominatim.js'

const SR = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = null
let isListening = false
let isWelcomePlaying = false
let micWindowTimer = null
let silenceTimer = null
let accumText = ''
let lastCommandAt = 0

const MIC_WINDOW_MS = 6000
const SILENCE_MS = 3500
const COOLDOWN_MS = 2500

async function say(text) {
  try { await speakArabicViaServer(text) } catch { /* noop */ }
}

function normalizeAr(s) {
  if (!s) return ''
  let out = ''
  for (const ch of s) {
    const c = ch.codePointAt(0)
    if (c >= 0x064B && c <= 0x065F) continue
    if (c === 0x0640) continue
    if (c === 0x0623 || c === 0x0625 || c === 0x0622 || c === 0x0671) { out += String.fromCharCode(0x0627); continue }
    if (c === 0x0649) { out += String.fromCharCode(0x064A); continue }
    out += ch
  }
  return out
}

function clearTimers() {
  if (micWindowTimer) { clearTimeout(micWindowTimer); micWindowTimer = null }
  if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null }
}

function safeStart() {
  try { recognition.start() } catch { /* already started */ }
}

function safeStop() {
  try { recognition.stop() } catch { /* not started */ }
}

export function toggleVoiceControl({  getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch, onStateChange, getRouteStats, getLocation  }) {
  if (!SR) {
    say('\u0645\u062D\u0631\u0643 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645')
    return
  }

  // Toggle: if listening, stop now
  if (isListening) {
    clearTimers()
    safeStop()
    isListening = false
    if (onStateChange) onStateChange(false)
    return
  }

  // Initialize recognition (fresh each session)
  recognition = new SR()
  recognition.lang = 'ar-SA'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 5

  isListening = true
  accumText = ''
  // onStateChange(true) moved to onstart

  stopSpeaking()
  // المايك مغلق تماماً هنا
  
  isWelcomePlaying = true
  
  say('\u0623\u0647\u0644\u0627 \u0628\u0643').then(() => {
    if (!isListening) return
    
    // المايك كان مغلقاً طوال حديث رنا، والآن نفتحه فوراً (0 ثانية)
    isWelcomePlaying = false 
    safeStart()
    accumText = '' 
    
    // بدء مؤقت الاستماع 5 ثوانٍ (أو 6 ثوانٍ)
    micWindowTimer = setTimeout(() => {
      console.log('MIC_WINDOW_CLOSED')
      try {
        if (accumText.trim()) {
          const speechText = normalizeAr(accumText.trim().toLowerCase())
          accumText = ''
          console.log('VOICE_FINAL_FORCED:', speechText)
          executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch, getRouteStats, getLocation })
        }
      } catch (e) {
        console.error('VOICE_CMD_ERR:', e)
      } finally {
        clearTimers()
        safeStop()
        isListening = false
        if (onStateChange) onStateChange(false)
      }
    }, 5000)
  })


  // Results handler
  recognition.onstart = function () {
    console.log('MIC_READY')
    if (onStateChange) onStateChange(true)
    // المؤقت يدار الآن من كتلة say()
  }

  recognition.onresult = function (event) {
    if (isWelcomePlaying) return;
    console.log('RAW_MIC_INPUT:', event.results[event.results.length - 1][0].transcript);
    // Get latest final/partial text
    let latest = ''
    for (let i = event.results.length - 1; i >= 0; i--) {
      const r = event.results[i]
      if (r.isFinal || r[0]) {
        latest = r[0].transcript.trim()
        if (latest) break
      }
    }
    if (!latest) return
    accumText = latest
    console.log('VOICE_PARTIAL:', accumText)

    if (silenceTimer) clearTimeout(silenceTimer)
    silenceTimer = setTimeout(() => {
      const speechText = normalizeAr(accumText.trim().toLowerCase())
      accumText = ''
      if (!speechText) return
      const now = Date.now()
      if (now - lastCommandAt < COOLDOWN_MS) {
        console.log('COOLDOWN_SKIP:', speechText)
        return
      }
      lastCommandAt = now
      console.log('VOICE_FINAL:', speechText)
      executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch, getRouteStats }); clearTimers(); safeStop(); isListening = false; if (onStateChange) onStateChange(false);
    }, SILENCE_MS)
  }

  // Error handler - never give up while window open
  recognition.onerror = function (event) {
    console.error('VOICE_ERR:', event.error)
    if (!isListening) return
    if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'audio-capture') {
      setTimeout(() => { if (isListening) safeStart() }, 800)
    }
  }

  // On end - restart if still in window
  recognition.onend = function () {
    if (!isListening) return
    setTimeout(() => { if (isListening) safeStart() }, 300)
  }
}

async function executeVoiceCommand(text, ctx) {
  console.log('DEBUG_EXEC:', JSON.stringify(text), '| tripActive:', ctx?.tripActive)
  const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch, getRouteStats, getLocation } = ctx || {}

  // ===== REMAINING ROUTE =====
  if (text.includes('تبقي') || text.includes('باقي') || text.includes('الوصول') || text.includes('نوصل') || text.includes('بقي') || text.includes('نبقى') || text.includes('متبقي') || text.includes('يوصل')) {
    if (!tripActive) {
      say('لا توجد رحلة نشطة حالياً')
      return
    }
    const timeEl = document.getElementById('waze-eta-time')
    const detailsEl = document.getElementById('waze-eta-details')
    if (timeEl && detailsEl && timeEl.innerText && detailsEl.innerText && !timeEl.innerText.includes('--')) {
      say('وقت الوصول ' + timeEl.innerText + '، ' + detailsEl.innerText)
    } else {
      const stats = typeof getRouteStats === 'function' ? getRouteStats() : null
      if (stats && stats.distance !== undefined && stats.duration !== undefined) {
        say('بقي ' + formatDistanceArabic(stats.distance) + '، ووقت الوصول ' + formatDurationArabic(stats.duration))
      } else {
        say('جاري حساب الوقت المتبقي')
      }
    }
    return
  }
  console.log('DEBUG_EXEC:', JSON.stringify(text), '| tripActive:', tripActive);
  const map = getMap ? getMap() : null


  // ===== REMAINING ROUTE =====
  if (text.includes('كم تبقى') || text.includes('كم باقي') || text.includes('الوصول') || text.includes('متى نوصل') || text.includes('كم بقي')) {
    if (!tripActive) {
      say('لا توجد رحلة نشطة حالياً');
      return;
    }
    const stats = typeof getRouteStats === 'function' ? getRouteStats() : null;
    if (stats && stats.distance !== undefined && stats.duration !== undefined) {
      say('بقي ' + formatDistanceArabic(stats.distance) + '، ووقت الوصول ' + formatDurationArabic(stats.duration));
    } else {
      say('جاري حساب الوقت المتبقي');
    }
    return;
  }


  // ===== WHERE AM I =====
  if (text.includes('وين احنا') || text.includes('اين نحن') || text.includes('اين وصلنا') || text.includes('وين وصلنا') || text.includes('اين احنا')) {
    const loc = typeof getLocation === 'function' ? getLocation() : null;
    if (!loc) {
      say('لا أعرف موقعك حالياً');
      return;
    }
    say('جاري تحديد الموقع...');
    reverseGeocode(loc.lat, loc.lng).then(area => {
      if (area) say('نحن الآن في ' + area);
      else say('لا أستطيع تحديد اسم المنطقة');
    });
    return;
  }

  // ===== CANCEL TRIP (Smart) =====
  const cancelRegex = /\u0644\u063A|\u0627\u0644\u063A|\u0648\u0642\u0641|\u0648\u0643\u0641|\u0627\u0646\u0647\u064A|\u0627\u0646\u0647\u0627\u0621|\u062E\u0644\u0627\u0635|\u062E\u0644\u0635|\u0643\u0646\u0633\u0644|\u0643\u0627\u0646\u0633\u0644/;
  
  
  if (cancelRegex.test(text) ) {
    console.log('CANCEL_TRIP_TRIGGERED:', text, '| isMisheard:');
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      setTimeout(() => { say('\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062D\u0644\u0629'); }, 600);
    }
    return;
  }

  console.log('VOICE_INPUT:', JSON.stringify(text))

  // ===== Filter Rana's navigation phrases =====
  const ranaFilter = [
    '\u0627\u0646\u0639\u0637\u0641',        // Ø§Ù†Ø¹Ø·Ù
    '\u0627\u0644\u062A\u0632\u0645',        // Ø§Ù„ØªØ²Ù…
    '\u0627\u062A\u062C\u0647',               // Ø§ØªØ¬Ù‡
    '\u062E\u0630 \u0627\u0644\u0645\u062E\u0631\u062C', // Ø®Ø° Ø§Ù„Ù…Ø®Ø±Ø¬
    '\u0648\u0635\u0644\u062A',               // ÙˆØµÙ„Øª
    '\u0627\u0644\u062D\u0627\u0641\u0629',   // Ø§Ù„Ø­Ø§ÙØ©
    '\u0645\u0646\u0637\u0642\u0629',         // Ù…Ù†Ø·Ù‚Ø©
    '\u0628\u0627\u0644\u0642\u0631\u0628',   // Ø¨Ø§Ù„Ù‚Ø±Ø¨
    '\u0646\u0647\u0627\u064A\u0629',         // Ù†Ù‡Ø§ÙŠØ©
    '\u0628\u0639\u062F \u0645\u062A\u0631', // Ø¨Ø¹Ø¯ Ù…ØªØ±
    '\u0628\u0639\u062F \u0643\u064A\u0644\u0648', // Ø¨Ø¹Ø¯ ÙƒÙŠÙ„Ùˆ
    '\u0627\u0644\u0637\u0631\u064A\u0642 \u064A\u0633\u0627\u0631', // Ø§Ù„Ø·Ø±ÙŠÙ‚ ÙŠØ³Ø§Ø±
    '\u0627\u0644\u0637\u0631\u064A\u0642 \u064A\u0645\u064A\u0646', // Ø§Ù„Ø·Ø±ÙŠÙ‚ ÙŠÙ…ÙŠÙ†
    '\u0645\u062A\u0631\u064B\u0627',          // Ù…ØªØ±Ø§Ù‹
    '\u0645\u062A\u0631',                      // Ù…ØªØ±
    '\u0643\u064A\u0644\u0648',                // ÙƒÙŠÙ„Ùˆ
    '\u062F\u0642\u064A\u0642\u0629',          // Ø¯Ù‚ÙŠÙ‚Ø©
    '\u062F\u0642\u0627\u0626\u0642',          // Ø¯Ù‚Ø§Ø¦Ù‚
    '\u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642', // Ø¹Ù„Ù‰ Ø§Ù„Ø·Ø±ÙŠÙ‚
    '\u062A\u062D\u062F\u064A\u062B',          // ØªØ­Ø¯ÙŠØ«
  ]
  // Allow if contains explicit report keywords
  const isExplicit = text.includes('\u0627\u0643\u0648') ||          // Ø§ÙƒÙˆ
                     text.includes('\u0633\u064A\u0637\u0631') ||      // Ø³ÙŠØ·Ø±
                     text.includes('\u062A\u0641\u062A\u064A\u0634') || // ØªÙØªÙŠØ´
                     text.includes('\u062D\u0627\u062F\u062B') ||      // Ø­Ø§Ø¯Ø«
                     text.includes('\u0645\u0637\u0628') ||            // Ù…Ø·Ø¨
                     text.includes('\u0637\u0633\u0629') ||            // Ø·Ø³Ø©
                     text.includes('\u0637\u0648\u0627\u0631') ||      // Ø·ÙˆØ§Ø±
                     text.includes('\u0643\u0627\u0645\u064A\u0631') || // ÙƒØ§Ù…ÙŠØ±
                     text.includes('\u0627\u0632\u062F\u062D\u0627\u0645') || text.includes('\u0632\u062D\u0645\u0629') || text.includes('\u0632\u062D\u0627\u0645') || // Ø§Ø²Ø¯Ø­Ø§Ù…
                     text.includes('\u062D\u064A\u0648\u0627\u0646') || // Ø­ÙŠÙˆØ§Ù†
                     text.includes('\u0628\u0646\u0632\u064A\u0646') || // Ø¨Ù†Ø²ÙŠÙ†
                     text.includes('\u0648\u0642\u0648\u062F') ||       // ÙˆÙ‚ÙˆØ¯
                     text.includes('\u062E\u0637\u0631') ||             // Ø®Ø·Ø±
                     text.includes('\u0637\u0642\u0633') ||             // Ø·Ù‚Ø³
                     text.includes('\u0627\u0639\u0645\u0627\u0644') || // Ø§Ø¹Ù…Ø§Ù„
                     text.includes('\u0645\u0633\u062F\u0648\u062F') || text.includes('\u0637\u0631\u064A\u0642') || text.includes('\u0645\u0633\u0627\u0631')    // Ù…Ø³Ø¯ÙˆØ¯

  if (!isExplicit) {
    for (const rf of ranaFilter) {
      if (text.includes(rf)) {
        console.log('IGNORED_RANA:', text)
        return
      }
    }
  }

  // ===== TAB SWITCHING =====
  if (text.includes('\u0627\u0639\u062F\u0627\u062F\u0627\u062A') || text.includes('\u062D\u0633\u0627\u0628\u064A')) {
    setActiveTab('settings'); say('\u0641\u062A\u062D\u062A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A'); return
  }
  if (text.includes('\u0645\u062D\u0641\u0648\u0638\u0629') || text.includes('\u0645\u0641\u0636\u0644\u0629')) {
    setActiveTab('saved'); say('\u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629'); return
  }

  // ===== ZOOM =====
  if (map) {
    if (text.includes('\u0642\u0631\u0628') && !text.includes('\u0645\u0633\u062A\u0634\u0641\u0649')) {
      map.zoomTo(map.getZoom() + 1); say('\u062A\u0645 \u0627\u0644\u062A\u0642\u0631\u064A\u0628'); return
    }
    if (text.includes('\u0628\u0639\u062F') && !text.includes('\u0645\u062A\u0631') && !text.includes('\u0628\u0644\u0627\u063A')) {
      map.zoomTo(map.getZoom() - 1); say('\u062A\u0645 \u0627\u0644\u0625\u0628\u0639\u0627\u062F'); return
    }
  }

    // ===== STOP TRIP =====
  if (
      text.includes('\u0648\u0643\u0641') || // ÙˆÙƒÙ
      text.includes('\u0627\u0646\u0647\u064A') || // Ø§Ù†Ù‡ÙŠ
      text.includes('\u0627\u0644\u063A\u0627\u0621') || // Ø§Ù„ØºØ§Ø¡
      text.includes('\u0627\u0644\u063A\u064A') || // Ø§Ù„ØºÙŠ
      text.includes('\u0627\u0648\u0642\u0641') || // Ø§ÙˆÙ‚Ù
      text.includes('\u0648\u0642\u0641') || // ÙˆÙ‚Ù
      text.includes('\u062E\u0644\u0635') || // Ø®Ù„Øµ
      text.includes('\u062E\u0644\u0627\u0635') // Ø®Ù„Ø§Øµ
    ) {
    if (typeof onStopTrip === 'function') {
      onStopTrip()
      say('\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062D\u0644\u0629')
    }
    return
  }

  // ===== START TRIP =====
  if (text.includes('\u0627\u0628\u062F\u0623') || text.includes('\u0627\u0628\u062F\u0627') || text.includes('\u0627\u0628\u062F\u064A') ||
      text.includes('\u0627\u0644\u0631\u062D\u0644\u0629') || text.includes('\u0627\u0644\u0631\u062D\u0644\u0647') || text.includes('\u0631\u062D\u0644\u0629') || text.includes('\u0631\u062D\u0644\u0647') ||
      text.includes('\u064A\u0644\u0627 \u0631\u0648\u062D') || text.includes('\u0645\u0634\u064A\u0646\u0627') ||
      text.includes('\u0633\u0627\u0641\u0631') || text.includes('\u0627\u0646\u0637\u0644\u0642') || text.includes('\u0645\u0646\u0637\u0644\u0642') ||
      text.includes('\u064A\u0644\u0627')) {
    if (!hasRoute) { say('\u062D\u062F\u062F \u0648\u062C\u0647\u0629 \u0623\u0648\u0644\u0627\u064B'); return }
    if (typeof onStartTrip === 'function') {
      onStartTrip()
    }
    return
  }

  // ===== NEARBY SEARCH =====
  const hasAko = text.includes('\u0627\u0643\u0648') || text.includes('\u0627\u0643\u0648\u0646') || text.includes('\u0647\u0646\u0627\u0643')
  const nearbyMap = [
    { kw: ['\u0645\u0633\u062A\u0634\u0641\u0649', '\u0645\u0633\u062A\u0634\u0641\u064A'], id: 'hospital', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0623\u0642\u0631\u0628 \u0645\u0633\u062A\u0634\u0641\u0649' },
    { kw: ['\u0635\u064A\u062F\u0644\u064A\u0629', '\u0635\u064A\u062F\u0644\u064A\u0647'], id: 'pharmacy', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0623\u0642\u0631\u0628 \u0635\u064A\u062F\u0644\u064A\u0629' },
    { kw: ['\u0628\u0646\u0632\u064A\u0646', '\u0648\u0642\u0648\u062F', '\u0645\u062D\u0637\u0629'], id: 'fuel', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0645\u062D\u0637\u0629 \u0648\u0642\u0648\u062F' },
    { kw: ['\u0645\u0637\u0639\u0645', '\u0623\u0643\u0644', '\u0627\u0643\u0644'], id: 'restaurant', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0645\u0637\u0639\u0645' },
    { kw: ['\u0645\u0642\u0647\u0649', '\u0642\u0647\u0648\u0629', '\u0643\u0627\u0641\u064A\u0647'], id: 'cafe', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0645\u0642\u0647\u0649' },
    { kw: ['\u0645\u0633\u062C\u062F', '\u062C\u0627\u0645\u0639'], id: 'mosque', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0645\u0633\u062C\u062F' },
    { kw: ['\u0645\u0635\u0631\u0641', '\u0628\u0646\u0643'], id: 'bank', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0645\u0635\u0631\u0641' },
    { kw: ['\u0641\u0646\u062F\u0642'], id: 'hotel', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0641\u0646\u062F\u0642' },
    { kw: ['\u0633\u0648\u0642'], id: 'market', say: '\u0623\u0628\u062D\u062B \u0639\u0646 \u0633\u0648\u0642' },
  ]
  if (!hasAko) {
    for (const entry of nearbyMap) {
      for (const kw of entry.kw) {
        if (text.includes(kw)) {
          if (typeof onNearbySearch !== 'function') { say('\u0627\u0644\u0628\u062D\u062B \u063A\u064A\u0631 \u0645\u062A\u0627\u062D'); return }
          say(entry.say)
          setTimeout(() => { onNearbySearch(entry.id) }, 1200)
          return
        }
      }
    }
  }

  // ===== FREE SEARCH =====
  if (!hasAko) {
    const freeTriggers = ['\u0627\u0628\u062D\u062B \u0639\u0646', '\u0648\u064A\u0646', '\u062F\u0648\u0631', '\u0634\u0648\u0641 \u0644\u064A']
    for (const trig of freeTriggers) {
      if (text.includes(trig)) {
        const query = text.substring(text.indexOf(trig) + trig.length).trim()
        if (query.length >= 2 && typeof onFreeSearch === 'function') {
          say('\u062C\u0627\u0631\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 ' + query)
          setTimeout(() => { onFreeSearch(query) }, 1200)
          return
        }
      }
    }
  }

  // ===== REPORTS =====
  let type = null
  let msg = ''

  if (text.includes('\u0633\u064A\u0637\u0631') || text.includes('\u062A\u0641\u062A\u064A\u0634') || text.includes('\u062D\u0627\u062C\u0632')) {
    type = 'checkpoint'; msg = '\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0646\u0642\u0637\u0629 \u062A\u0641\u062A\u064A\u0634'
  } else if (text.includes('\u062D\u0627\u062F\u062B') || text.includes('\u062F\u0639\u0645\u064A\u0629') || text.includes('\u0635\u062F\u0645') || text.includes('\u062A\u0635\u0627\u062F\u0645')) {
    type = 'accident'; msg = '\u062A\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u062D\u0627\u062F\u062B'
  } else if (text.includes('\u0645\u0637\u0628') || text.includes('\u0637\u0633\u0629') || text.includes('\u062D\u0641\u0631\u0629') || text.includes('\u062F\u0628\u0629') || text.includes('\u0637\u0627\u0633\u0647') || text.includes('\u0642\u0635\u0647')) {
    type = 'speed_bump'; msg = '\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0645\u0637\u0628'
  } else if (text.includes('\u0627\u0632\u062F\u062D\u0627\u0645')) {
    if (text.includes('\u0642\u0648\u064A') || text.includes('\u0634\u062F\u064A\u062F')) {
      type = 'traffic_heavy'; msg = '\u0627\u0632\u062F\u062D\u0627\u0645 \u0634\u062F\u064A\u062F'
    } else {
      type = 'traffic'; msg = '\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0632\u062F\u062D\u0627\u0645'
    }
  } else if (text.includes('\u0643\u0627\u0645\u064A\u0631') || text.includes('\u0631\u0627\u062F\u0627\u0631') || text.includes('\u0645\u0631\u0627\u0642\u0628')) {
    type = 'camera'; msg = '\u062A\u0646\u0628\u064A\u0647\u060C \u0631\u0627\u062F\u0627\u0631'
  } else if (text.includes('\u0637\u0648\u0627\u0631') || text.includes('\u0627\u0633\u062A\u063A\u0627\u062B') || text.includes('\u0646\u062C\u062F\u0629') || text.includes('\u0639\u0627\u0637\u0644')) {
    type = 'emergency'; msg = '\u0637\u0648\u0627\u0631\u0626'
  } else if (text.includes('\u062D\u064A\u0648\u0627\u0646') || text.includes('\u0628\u0642\u0631') || text.includes('\u063A\u0646\u0645') || text.includes('\u0628\u0647\u064A\u0645\u0629')) {
    type = 'animals'; msg = '\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642'
  } else if (text.includes('\u0637\u0642\u0633') || text.includes('\u0645\u0637\u0631') || text.includes('\u0627\u0645\u0637\u0627\u0631') || text.includes('\u062A\u0631\u0627\u0628') || text.includes('\u0647\u0648\u0629') || text.includes('\u063A\u0628\u0627\u0631')) {
    type = 'bad_weather'; msg = '\u0637\u0642\u0633 \u0633\u064A\u0621'
  } else if (text.includes('\u0627\u0639\u0645\u0627\u0644') || text.includes('\u0635\u064A\u0627\u0646\u0629') || text.includes('\u062A\u0639\u0645\u064A\u0631') || text.includes('\u0637\u0631\u064A\u0642')) {
    type = 'road_work'; msg = '\u0623\u0639\u0645\u0627\u0644 \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642'
  } else if (text.includes('\u0645\u0633\u062F\u0648\u062F') || text.includes('\u0645\u063A\u0644\u0642') || text.includes('\u062E\u0637\u0631')) {
    type = 'hazard'; msg = '\u0639\u0627\u0626\u0642 \u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642'
  } else if (text.includes('\u0648\u0642\u0648\u062F') || text.includes('\u0628\u0646\u0632\u064A\u0646')) {
    type = 'fuel'; msg = '\u0645\u062D\u0637\u0629 \u0648\u0642\u0648\u062F'
  }

  if (!type) {
    say('\u0644\u0645 \u0623\u0641\u0647\u0645')
    return
  }

  if (typeof submitReport !== 'function') {
    say('\u062E\u062F\u0645\u0629 \u0627\u0644\u0628\u0644\u0627\u063A\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      console.log('VOICE_SUBMIT:', type, JSON.stringify(gps))
      try {
        await submitReport(type, gps)
        say(msg)
        if (map) map.easeTo({ center: [gps.lng, gps.lat], zoom: 15, duration: 800 })
      } catch (e) {
        console.error('VOICE_REPORT_ERR:', e)
        say('\u0641\u0634\u0644 \u0627\u0644\u062A\u0633\u062C\u064A\u0644')
      }
    },
    (err) => {
      console.error('VOICE_GPS_ERR:', err)
      // Fallback: use map center
      if (map) {
        const c = map.getCenter()
        console.log('VOICE_SUBMIT_FALLBACK:', type, JSON.stringify({ lat: c.lat, lng: c.lng }))
        submitReport(type, { lat: c.lat, lng: c.lng }).then(() => say(msg)).catch(() => say('\u0641\u0634\u0644 \u0627\u0644\u062A\u0633\u062C\u064A\u0644'))
      } else {
        say('\u0644\u0645 \u0623\u0633\u062A\u0637\u0639 \u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0642\u0639\u0643')
      }
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
  )
}