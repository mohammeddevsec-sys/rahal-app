import fs from 'fs';

// ===== 1. إرجاع النطق إلى App.jsx (startTrip) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إزالة أي تعليق سابق
app = app.replace(/\/\* voice moved to voiceControl \*\//g, '');
app = app.replace(/\/\* silent start trip \*\//g, '');

// إضافة النطق بعد setTripActive(true)
if (!app.includes('speakArabic(UI_TEXT.tripStarted')) {
  app = app.replace(
    'setTripActive(true)',
    "setTripActive(true)\n    speakArabic(UI_TEXT.tripStarted + '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')"
  );
  console.log('APP_JSX: VOICE_RESTORED');
} else {
  console.log('APP_JSX: ALREADY_HAS_VOICE');
}

fs.writeFileSync(appPath, app, 'utf8');

// ===== 2. إزالة say من voiceControl.js (لتجنب التكرار والتعارض) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة setTumeout/say الذي أضفناه مؤخراً
const voiceBlockRegex = /if \(typeof onStartTrip === 'function'\) \{\s*onStartTrip\(\)\s*setTimeout\(\(\) => \{\s*say\('[^']*'\)\s*\}, 300\)\s*\}/;
if (voiceBlockRegex.test(vc)) {
  vc = vc.replace(voiceBlockRegex, "if (typeof onStartTrip === 'function') onStartTrip()");
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE_CONTROL: SAY_REMOVED');
} else {
  console.log('VOICE_CONTROL: PATTERN_NOT_FOUND');
}
console.log('DONE');