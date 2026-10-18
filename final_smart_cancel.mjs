import fs from 'fs';

// ===== 1. voiceControl.js: إضافة tripActive للاستدعاء والتفكيك =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// أ) إضافة tripActive لاستدعاء executeVoiceCommand
vc = vc.replace(
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch })",
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch })"
);

// ب) التأكد من التفكيك يحتوي على tripActive (موجود مسبقاً، لكن للتأكيد)
vc = vc.replace(
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch } = ctx",
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx"
);

// ج) استبدال بلوك الإلغاء القديم (if text.includes) ببلوك ذكي يستخدم tripActive
const oldBlockRegex = /\/\/ ===== CANCEL TRIP =====[\s\S]*?return;\s*\}/;
const newBlock = `// ===== CANCEL TRIP (Smart) =====
  const cancelRegex = /\\u0644\\u063A|\\u0627\\u0644\\u063A|\\u0648\\u0642\\u0641|\\u0648\\u0643\\u0641|\\u0627\\u0646\\u0647\\u064A|\\u062E\\u0644\\u0627\\u0635|\\u062E\\u0644\\u0635|\\u0643\\u0646\\u0633\\u0644|\\u0643\\u0627\\u0646\\u0633\\u0644/;
  const isMisheard = (text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647')) && tripActive === true;
  
  if (cancelRegex.test(text) || isMisheard) {
    console.log('CANCEL_TRIP_TRIGGERED:', text, '| isMisheard:', isMisheard, '| tripActive:', tripActive);
    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 600);
    }
    return;
  }`;

if (oldBlockRegex.test(vc)) {
  vc = vc.replace(oldBlockRegex, newBlock);
  console.log('VOICE_CONTROL: SMART_CANCEL_REPLACED');
} else {
  console.log('VOICE_CONTROL: OLD_BLOCK_NOT_FOUND');
}

fs.writeFileSync(vcPath, vc, 'utf8');

// ===== 2. App.jsx: التأكد من تمرير tripActive =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إضافة tripActive: tripActive بعد hasRoute
if (!app.includes('tripActive: tripActive,')) {
  app = app.replace(
    "hasRoute: !!routeInfo,",
    "hasRoute: !!routeInfo,\n      tripActive: tripActive,"
  );
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: tripActive PASSED');
}

// التأكد من وجود tripActive في deps (أو إزالته)
if (app.includes('tripActive, handlePickCategory')) {
  console.log('APP_JSX: deps already has tripActive');
} else {
  app = app.replace(
    "}, [routeInfo, startTrip, stopTrip, handlePickCategory, handleVoiceFreeSearch])",
    "}, [routeInfo, startTrip, stopTrip, tripActive, handlePickCategory, handleVoiceFreeSearch])"
  );
  fs.writeFileSync(appPath, app, 'utf8');
}

console.log('DONE');