import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
const c = fs.readFileSync(f, 'utf8');

// 1. طباعة توقيع الدالة
const execMatch = c.match(/async function executeVoiceCommand\([^)]+\)/);
console.log('EXEC_SIGNATURE:', execMatch ? execMatch[0] : 'NOT_FOUND');

// 2. طباعة أول 15 سطر من الدالة (بلوك الإلغاء)
const idx = c.indexOf('async function executeVoiceCommand');
if (idx !== -1) {
  console.log('--- FIRST 20 LINES ---');
  console.log(c.substring(idx, idx + 1200));
  console.log('--- END ---');
}

// 3. طباعة كيف يُستدعى executeVoiceCommand
const callIdx = c.indexOf('executeVoiceCommand(speechText');
if (callIdx !== -1) {
  console.log('--- CALL ---');
  console.log(c.substring(callIdx, callIdx + 300));
}

// 4. طباعة كيف يُستدعى toggleVoiceControl في App.jsx
const app = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');
const tvcIdx = app.indexOf('toggleVoiceControl({');
if (tvcIdx !== -1) {
  console.log('--- APP_CALL ---');
  console.log(app.substring(tvcIdx, tvcIdx + 400));
}