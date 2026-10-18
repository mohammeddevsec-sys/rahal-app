import fs from 'fs';

// ===== 1. إسكات المساعد عند بدء الرحلة (في App.jsx) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إزالة جملة النطق من دالة startTrip
const startTripVoiceRegex = /speakArabic\(UI_TEXT\.tripStarted[\s\S]*?\)/;
if (startTripVoiceRegex.test(app)) {
  app = app.replace(startTripVoiceRegex, '/* silent start trip */');
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: START_TRIP_SILENCED');
}

// ===== 2. إسكات المساعد عند بدء الرحلة (في voiceControl.js) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// البحث عن استدعاء onStartTrip وإزالة أي say مرتبطة به
const startBlockRegex = /if\s*\(typeof onStartTrip === 'function'\)\s*\{\s*onStartTrip\(\)\s*say\([^)]*\)\s*\}/;
if (startBlockRegex.test(vc)) {
  vc = vc.replace(startBlockRegex, "if (typeof onStartTrip === 'function') onStartTrip()");
  console.log('VOICE_CONTROL: START_TRIP_SILENCED');
}

// تحسين وقت المايك ليكون 7 ثوانٍ للسماح بالكلام المريح
vc = vc.replace(/const MIC_WINDOW_MS = \d+/, 'const MIC_WINDOW_MS = 7000');
vc = vc.replace(/const SILENCE_MS = \d+/, 'const SILENCE_MS = 1000');

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('VOICE_CONTROL: TIMING_UPDATED (7s window, 1s silence)');
console.log('DONE');