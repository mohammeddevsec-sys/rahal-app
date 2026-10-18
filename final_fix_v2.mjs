import fs from 'fs';

// 1. استعادة النسخة النظيفة من v13 لضمان عدم وجود أخطاء سابقة
const bkDir = fs.readdirSync('D:/RAHAL/_backups').filter(d => d.startsWith('STABLE_v13_FINAL')).sort().pop();
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
const appPath = 'D:/RAHAL/src/App.jsx';

fs.copyFileSync(`D:/RAHAL/_backups/${bkDir}/src/lib/voiceControl.js`, vcPath);
fs.copyFileSync(`D:/RAHAL/_backups/${bkDir}/src/App.jsx`, appPath);
console.log('RESTORED_FROM_V13');

let c = fs.readFileSync(vcPath, 'utf8');

// 2. إضافة tripActive للتوقيع والتفكيك
c = c.replace(
  "onStartTrip, onStopTrip, hasRoute, onNearbySearch",
  "onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch"
);
c = c.replace(
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch } = ctx",
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx"
);

// 3. حقن منطق "isMisheard" بشكل مرن (regex يقبل أي مسافات)
const oldRegex = /if\s*\(\s*cancelRegex\.test\(text\)\s*\)\s*\{/;
const newCode = `const isMisheard = (text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647')) && tripActive === true;
  if (cancelRegex.test(text) || isMisheard) {`;

if (oldRegex.test(c)) {
  c = c.replace(oldRegex, newCode);
  console.log('IS_MISHEARD: INJECTED');
} else {
  console.log('IS_MISHEARD: NOT_FOUND - CHECKING...');
  // طباعة السطر للتحقق
  const lines = c.split('\n');
  const idx = lines.findIndex(l => l.includes('cancelRegex.test'));
  if (idx !== -1) console.log('LINE:', lines[idx]);
}

fs.writeFileSync(vcPath, c, 'utf8');

// 4. إضافة tripActive لاعتماديات App.jsx
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(
  "}, [routeInfo, startTrip, stopTrip, handlePickCategory, handleVoiceFreeSearch])",
  "}, [routeInfo, startTrip, stopTrip, tripActive, handlePickCategory, handleVoiceFreeSearch])"
);
fs.writeFileSync(appPath, app, 'utf8');
console.log('DONE');