import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// 1) أضف متغيرات للنافذة الزمنية
if (!c.includes('let micWindowTimer')) {
  c = c.replace(
    'let isListening = false',
    'let isListening = false\nlet micWindowTimer = null\nconst MIC_WINDOW_MS = 12000'
  );
  changes++;
  console.log('VARS: ADDED');
}

// 2) في toggleVoiceControl: عند فتح الميكروفون → اضبط مؤقت 12 ثانية
const oldStart = `  isListening = true
  if (onStateChange) onStateChange(true)`;

const newStart = `  isListening = true
  if (onStateChange) onStateChange(true)
  if (micWindowTimer) clearTimeout(micWindowTimer)
  micWindowTimer = setTimeout(() => {
    console.log('MIC_WINDOW_CLOSED')
    try { recognition.stop() } catch { /* noop */ }
    isListening = false
    if (onStateChange) onStateChange(false)
  }, MIC_WINDOW_MS)`;

if (c.includes(oldStart)) {
  c = c.replace(oldStart, newStart);
  changes++;
  console.log('WINDOW: TIMER ADDED');
} else {
  console.log('WINDOW: PATTERN_NOT_FOUND');
}

// 3) onerror no-speech: لا تُغلق — فقط استمر
const oldErr = `  recognition.onerror = function (event) {
    console.error('VOICE_ERR:', event.error)
    if (event.error === 'no-speech' && isListening) {
      // أعد المحاولة دون إيقاف الاستماع
      try { recognition.start() } catch { /* noop */ }
      return
    }
    isListening = false
    if (onStateChange) onStateChange(false)
  }`;

const newErr = `  recognition.onerror = function (event) {
    console.error('VOICE_ERR:', event.error)
    if ((event.error === 'no-speech' || event.error === 'aborted') && isListening) {
      try { recognition.start() } catch { /* noop */ }
      return
    }
    // أخطاء أخرى: تجاهل، النافذة الزمنية ستُغلق
  }`;

if (c.includes(oldErr)) {
  c = c.replace(oldErr, newErr);
  changes++;
  console.log('ERROR: SOFT HANDLING');
} else {
  console.log('ERROR: PATTERN_NOT_FOUND');
}

// 4) onend: restart إذا ما زلنا داخل النافذة
const oldOnEnd = `  recognition.onend = function () {
    if (isListening) {
      // continuous mode: restart automatically
      try { recognition.start() } catch { /* noop */ }
      return
    }
    if (onStateChange) onStateChange(false)
  }`;

const newOnEnd = `  recognition.onend = function () {
    if (isListening) {
      try { recognition.start() } catch { /* noop */ }
      return
    }
  }`;

if (c.includes(oldOnEnd)) {
  c = c.replace(oldOnEnd, newOnEnd);
  changes++;
  console.log('ONEND: QUIET_RESTART');
} else {
  console.log('ONEND: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);