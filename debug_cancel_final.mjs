import fs from 'fs';

// 1. إضافة فحص دقيق في voiceControl.js
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

vc = vc.replace(
  "console.log('CANCEL_TRIP_TRIGGERED:', text);",
  "console.log('CANCEL_TRIP_TRIGGERED:', text, '| onStopTrip TYPE:', typeof ctx.onStopTrip);"
);
fs.writeFileSync(vcPath, vc, 'utf8');

// 2. إضافة تأكيد في stopTrip داخل App.jsx
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
if (!app.includes('STOP_TRIP_ENTERED')) {
  app = app.replace(
    'const stopTrip = useCallback(() => {',
    'const stopTrip = useCallback(() => {\n    console.log("STOP_TRIP_ENTERED");'
  );
  fs.writeFileSync(appPath, app, 'utf8');
}
console.log('DONE');