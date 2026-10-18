import fs from 'fs';

// ===== 1. إضافة تأكيد صوتي في voiceControl.js بعد إيقاف الرحلة =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// نستخدم setTimeout لضمان انتهاء stopTrip (والتي تنادي stopSpeaking) قبل تشغيل الصوت
const oldCancel = `    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      say('\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062D\u0644\u0629');
    } else {`;

const newCancel = `    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      setTimeout(() => {
        say('\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062D\u0644\u0629');
      }, 100);
    } else {`;

if (vc.includes(oldCancel)) {
  vc = vc.replace(oldCancel, newCancel);
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE_CONTROL: SAY_DELAY_ADDED');
}

// ===== 2. إضافة تأكيد في App.jsx (لنرى هل stopTrip ينفذ) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('STOP_TRIP_EXECUTED')) {
  app = app.replace(
    'const stopTrip = useCallback(() => {',
    'const stopTrip = useCallback(() => {\n    console.log("STOP_TRIP_EXECUTED");'
  );
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: STOP_TRIP_LOG_ADDED');
}
console.log('DONE');