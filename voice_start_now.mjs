import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// ===== 1) بدء الاستماع فوراً (بدون setTimeout) =====
const oldStart = `  setTimeout(() => {
    if (!isListening) return
    try {
      recognition.start()
    } catch (e) {
      console.error('VOICE_START_ERR:', e)
      isListening = false
      if (onStateChange) onStateChange(false)
    }
  }, 1800)`;

const newStart = `  try {
    recognition.start()
  } catch (e) {
    console.error('VOICE_START_ERR:', e)
    isListening = false
    if (onStateChange) onStateChange(false)
  }`;

if (c.includes(oldStart)) {
  c = c.replace(oldStart, newStart);
  changes++;
  console.log('START_TIMING: IMMEDIATE');
} else {
  console.log('START_TIMING: PATTERN_NOT_FOUND (trying alt)');
  // جرّب الأنماط الأخرى
  const alt = /setTimeout\(\(\) => \{\s*if \(!isListening\) return[\s\S]*?\}, \d+\)/;
  if (alt.test(c)) {
    c = c.replace(alt, `try {
    recognition.start()
  } catch (e) {
    console.error('VOICE_START_ERR:', e)
    isListening = false
    if (onStateChange) onStateChange(false)
  }`);
    changes++;
    console.log('START_TIMING: IMMEDIATE (regex)');
  }
}

// ===== 2) أضف "أهلا" و"هلا" و"مرحبا" للفلتر =====
const oldFilterEnd = `    '\\u062A\\u062D\\u062F\\u064A\\u062B', '\\u0645\\u0648\\u0642\\u0639\\u0643', '\\u0627\\u0644\\u0637\\u0631\\u064A\\u0642',
  ];`;

const newFilterEnd = `    '\\u062A\\u062D\\u062F\\u064A\\u062B', '\\u0645\\u0648\\u0642\\u0639\\u0643', '\\u0627\\u0644\\u0637\\u0631\\u064A\\u0642',
    '\\u0623\\u0647\\u0644\\u0627', '\\u0627\\u0647\\u0644\\u0627', '\\u0647\\u0644\\u0627', '\\u0628\\u0643', '\\u0645\\u0631\\u062D\\u0628\\u0627',
  ];`;

if (c.includes(oldFilterEnd)) {
  c = c.replace(oldFilterEnd, newFilterEnd);
  changes++;
  console.log('FILTER: ADDED welcome words');
} else {
  console.log('FILTER: PATTERN_NOT_FOUND');
}

// ===== 3) أضف "طوارئ" (بالهمزة) لفئة الطوارئ =====
const oldEmerg = "} else if (text.includes('\\u0639\\u0627\\u0637\\u0644') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A')) {";
const newEmerg = "} else if (text.includes('\\u0639\\u0627\\u0637\\u0644') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u0626') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A\\u0621')) {";

if (c.includes(oldEmerg)) {
  c = c.replace(oldEmerg, newEmerg);
  changes++;
  console.log('EMERGENCY: ADDED همرة + ياء + ياء-همزة');
} else {
  console.log('EMERGENCY: PATTERN_NOT_FOUND');
}

// ===== 4) إعادة تشغيل الاستماع تلقائياً عند no-speech (بدل إيقافه) =====
const oldErr = `  recognition.onerror = function (event) {
    console.error('VOICE_ERR:', event.error)
    isListening = false
    if (onStateChange) onStateChange(false)
  }`;

const newErr = `  recognition.onerror = function (event) {
    console.error('VOICE_ERR:', event.error)
    if (event.error === 'no-speech' && isListening) {
      // أعد المحاولة دون إيقاف الاستماع
      try { recognition.start() } catch { /* noop */ }
      return
    }
    isListening = false
    if (onStateChange) onStateChange(false)
  }`;

if (c.includes(oldErr)) {
  c = c.replace(oldErr, newErr);
  changes++;
  console.log('NO_SPEECH: AUTO_RESTART');
} else {
  console.log('NO_SPEECH: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);