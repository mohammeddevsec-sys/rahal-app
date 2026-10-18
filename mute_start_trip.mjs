import fs from 'fs';

// ===== 1. إسكات بدء الرحلة في App.jsx (إزالة أي نطق داخل startTrip) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const startTripRegex = /const startTrip = useCallback\(\(\) => \{([\s\S]*?)\}, \[[^\]]*\]\)/;
if (startTripRegex.test(app)) {
  app = app.replace(startTripRegex, (match, body) => {
    // إزالة أي استدعاء speakArabic من داخل دالة بدء الرحلة
    const cleanBody = body.replace(/speakArabic\([\s\S]*?\)/g, '/* silent */');
    return `const startTrip = useCallback(() => {${cleanBody}}, [routeInfo, location, applyRoute])`;
  });
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: START_TRIP_MUTED');
}

// ===== 2. إسكات أي رد صوتي عند بدء الرحلة في voiceControl.js =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

const onStartRegex = /if\s*\(typeof onStartTrip === 'function'\)\s*\{([\s\S]*?)\}/g;
if (onStartRegex.test(vc)) {
  vc = vc.replace(onStartRegex, 'if (typeof onStartTrip === \'function\') { onStartTrip(); /* silent */ }');
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE_CONTROL: START_TRIP_SILENT');
}
console.log('DONE');