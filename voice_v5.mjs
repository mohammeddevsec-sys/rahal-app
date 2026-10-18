import fs from 'fs';

// ========== voiceControl.js ==========
const vPath = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vPath, 'utf8');

// 1) إرجاع الطوارئ للسطر الأصلي
const emergNew = "  } else if (text.includes('\\u0639\\u0627\\u0637\\u0644') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u0626') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A\\u0621') || text.includes('\\u0646\\u062C\\u062F\\u0629') || text.includes('\\u0627\\u0633\\u062A\\u063A\\u0627\\u062B\\u0629') || text.includes('\\u0637\\u0648\\u0627\\u0631')) {";
const emergOld = "  } else if (text.includes('\\u0639\\u0627\\u0637\\u0644') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A')) {";

if (v.includes(emergNew)) {
  v = v.replace(emergNew, emergOld);
  console.log('EMERGENCY: REVERTED');
} else {
  console.log('EMERGENCY: PATTERN_NOT_FOUND');
}

// 2) إضافة الترحيب + تأخير قبل الاستماع
// ابحث عن "recognition.start()" في toggleVoiceControl
const oldStart = `  /* silent - visual feedback via button */

  try {
    recognition.start()
  } catch (e) {
    console.error('VOICE_START_ERR:', e)
    isListening = false
    if (onStateChange) onStateChange(false)
  }`;

const newStart = `  say('\\u0623\\u0647\\u0644\\u0627\\u064B \\u0628\\u0643 \\u0646\\u0648\\u0631\\u062A')

  setTimeout(() => {
    if (!isListening) return
    try {
      recognition.start()
    } catch (e) {
      console.error('VOICE_START_ERR:', e)
      isListening = false
      if (onStateChange) onStateChange(false)
    }
  }, 1800)`;

if (v.includes(oldStart)) {
  v = v.replace(oldStart, newStart);
  console.log('WELCOME: ADDED');
} else {
  console.log('WELCOME: PATTERN_NOT_FOUND');
}

fs.writeFileSync(vPath, v, 'utf8');

// ========== App.jsx: أيقونة جديدة ==========
const aPath = 'D:/RAHAL/src/App.jsx';
let a = fs.readFileSync(aPath, 'utf8');

// استبدال الـ emoji 🎤 بأيقونة SVG مكبر صوت
const oldBtn = `{isMicListening ? "…" : "🎤"}`;
const newBtn = `{isMicListening ? "…" : <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/><path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>}`;

if (a.includes(oldBtn)) {
  a = a.replace(oldBtn, newBtn);
  console.log('ICON: REPLACED');
} else {
  console.log('ICON: NO_MATCH');
}

fs.writeFileSync(aPath, a, 'utf8');
console.log('DONE');