import fs from 'fs';

// 1. إصلاح App.jsx (إضافة tripActive للاعتماديات)
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(
  "}, [routeInfo, startTrip, stopTrip, handlePickCategory, handleVoiceFreeSearch])",
  "}, [routeInfo, startTrip, stopTrip, tripActive, handlePickCategory, handleVoiceFreeSearch])"
);
fs.writeFileSync(appPath, app, 'utf8');

// 2. إصلاح voiceControl.js بالكامل (إعادة كتابة دالة الإلغاء بترتيب صحيح)
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// البحث عن بداية دالة التنفيذ
const startIdx = vc.indexOf('async function executeVoiceCommand(text, ctx) {');
const endIdx = vc.indexOf('const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx');

if (startIdx !== -1 && endIdx !== -1) {
  // الكود الجديد: التفكيك أولاً، ثم فحص الإلغاء بذكاء
  const newExecStart = `async function executeVoiceCommand(text, ctx) {
  const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx;
  const map = getMap ? getMap() : null;

  // ===== CANCEL TRIP (Smart) =====
  const cancelRegex = /\\u0644\\u063A|\\u0627\\u0644\\u063A|\\u0648\\u0642\\u0641|\\u0648\\u0643\\u0641|\\u0627\\u0646\\u0647\\u064A|\\u062E\\u0644\\u0627\\u0635|\\u062E\\u0644\\u0635|\\u0643\\u0646\\u0633\\u0644|\\u0643\\u0627\\u0646\\u0633\\u0644/;
  const isMisheard = (text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647')) && tripActive === true;

  if (cancelRegex.test(text) || isMisheard) {
    console.log('CANCEL_TRIP_TRIGGERED:', text, '| isMisheard:', isMisheard);
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      setTimeout(() => {
        say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
      }, 800);
    }
    return;
  }

  console.log('VOICE_INPUT:', JSON.stringify(text));

  // (باقي الكود كما هو...)
`;
  // استبدال الجزء العلوي من الدالة بالكود الجديد
  vc = vc.substring(0, startIdx) + newExecStart + vc.substring(endIdx + 150);
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('DONE');
} else {
  console.log('ERROR: Could not find function boundaries');
}