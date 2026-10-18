import fs from 'fs';

// 1. طباعة كامل استدعاء toggleVoiceControl في App.jsx
const app = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');
const idx = app.indexOf('toggleVoiceControl({');
if (idx !== -1) {
  let endIdx = app.indexOf('})', idx);
  if (endIdx === -1) endIdx = idx + 800;
  console.log('--- FULL toggleVoiceControl CALL ---');
  console.log(app.substring(idx, endIdx + 2));
  console.log('--- END ---');
}

// 2. التحقق من تعريف stopTrip
const sIdx = app.indexOf('const stopTrip = useCallback');
if (sIdx !== -1) {
  console.log('--- stopTrip DEF ---');
  console.log(app.substring(sIdx, sIdx + 150));
}

// 3. التحقق من onStopTrip في deps
const depsMatch = app.match(/const handleVoiceClick[\s\S]*?\]\)/);
if (depsMatch) {
  console.log('--- handleVoiceClick deps ---');
  const depMatch = depsMatch[0].match(/\}, \[([^\]]+)\]\)/);
  if (depMatch) console.log('Deps:', depMatch[1]);
}

// 4. إضافة log في بداية stopTrip
if (!app.includes('STOP_TRIP_CALLED')) {
  const newStop = app.replace(
    'const stopTrip = useCallback(() => {',
    'const stopTrip = useCallback(() => {\n    console.log("STOP_TRIP_CALLED")'
  );
  fs.writeFileSync('D:/RAHAL/src/App.jsx', newStop, 'utf8');
  console.log('STOP_TRIP_LOG: ADDED');
}

// 5. إضافة log للتحقق من typeof ctx.onStopTrip
const vc = fs.readFileSync('D:/RAHAL/src/lib/voiceControl.js', 'utf8');
const vcFixed = vc.replace(
  "console.log('CANCEL_TRIP_TRIGGERED:', text);",
  "console.log('CANCEL_TRIP_TRIGGERED:', text, '| onStopTrip TYPE:', typeof ctx.onStopTrip);"
);
fs.writeFileSync('D:/RAHAL/src/lib/voiceControl.js', vcFixed, 'utf8');
console.log('CHECK_ONSTOPTRIP_TYPE: ADDED');