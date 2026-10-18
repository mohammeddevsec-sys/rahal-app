import fs from 'fs';

// 1. استعادة الملف النظيف من النسخة الذهبية v13
const bkDir = fs.readdirSync('D:/RAHAL/_backups').filter(d => d.startsWith('STABLE_v13_FINAL')).sort().pop();
if (!bkDir) { console.log('V13_NOT_FOUND'); process.exit(1); }
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
fs.copyFileSync(`D:/RAHAL/_backups/${bkDir}/src/lib/voiceControl.js`, vcPath);
console.log('VOICE_CONTROL: RESTORED_FROM_V13');

// 2. تطبيق منطق الإلغاء الذكي بأمان
let c = fs.readFileSync(vcPath, 'utf8');

// أ) إضافة tripActive للتوقيع
c = c.replace(
  "onStartTrip, onStopTrip, hasRoute, onNearbySearch",
  "onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch"
);

// ب) إضافة tripActive للتفكيك
c = c.replace(
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch } = ctx",
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx"
);

// ج) حقن شرط الذكاء الاصطناعي (isMisheard) داخل بلوك CANCEL_TRIP
const oldCancelTest = "if (cancelRegex.test(text)) {";
const newCancelTest = "const isMisheard = (text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647')) && tripActive === true;\n  if (cancelRegex.test(text) || isMisheard) {";
c = c.replace(oldCancelTest, newCancelTest);

fs.writeFileSync(vcPath, c, 'utf8');

// 3. إصلاح App.jsx (إضافة tripActive لمصفوفة الاعتماديات)
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(
  "}, [routeInfo, startTrip, stopTrip, handlePickCategory, handleVoiceFreeSearch])",
  "}, [routeInfo, startTrip, stopTrip, tripActive, handlePickCategory, handleVoiceFreeSearch])"
);
fs.writeFileSync(appPath, app, 'utf8');
console.log('DONE');