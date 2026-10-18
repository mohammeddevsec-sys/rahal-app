import fs from 'fs';

// 1. فحص وجود onStopTrip في App.jsx
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
const hasOnStop = app.includes('onStopTrip: stopTrip');
console.log('APP_HAS_onStopTrip:', hasOnStop);

// 2. فحص وجود أمر الإلغاء في voiceControl.js
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');
const hasCancel = vc.includes('CANCEL_TRIP_TRIGGERED');
console.log('VOICE_HAS_CANCEL:', hasCancel);

// 3. طباعة السطر الذي يحتوي على فحص الكلمات
const lines = vc.split('\n');
const idx = lines.findIndex(l => l.includes('CANCEL_TRIP'));
if (idx !== -1) {
  console.log('--- CANCEL BLOCK START ---');
  console.log(lines.slice(idx - 2, idx + 15).join('\n'));
  console.log('--- CANCEL BLOCK END ---');
}