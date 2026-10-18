import fs from 'fs';

// ===== 1. App.jsx: تمرير handlePickCategory =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const oldApp = `      onStartTrip: startTrip,
      hasRoute: !!routeInfo,
      onStateChange: setIsMicListening,`;

const newApp = `      onStartTrip: startTrip,
      hasRoute: !!routeInfo,
      onNearbySearch: handlePickCategory,
      onStateChange: setIsMicListening,`;

if (app.includes(oldApp)) {
  app = app.replace(oldApp, newApp);
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: onNearbySearch ADDED');
} else {
  console.log('APP_JSX: NO_MATCH');
}

// ===== 2. voiceControl.js =====
const vPath = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vPath, 'utf8');

// 2a. توقيع toggleVoiceControl
v = v.replace(
  "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onStateChange }) {",
  "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onStateChange }) {"
);

// 2b. تمرير الخيارات
v = v.replace(
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute })",
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch })"
);

v = v.replace(
  "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute }) {",
  "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch }) {"
);

// 2c. إضافة كتلة البحث الصوتي قبل "// start trip"
const nearbyBlock = `  // nearby categories voice search
  const nearbyMap = [
    { kw: ['\\u0645\\u0633\\u062A\\u0634\\u0641\\u0649', '\\u0645\\u0633\\u062A\\u0634\\u0641\\u064A'], id: 'hospital', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u0633\\u062A\\u0634\\u0641\\u0649' },
    { kw: ['\\u0639\\u064A\\u0627\\u062F\\u0629', '\\u0639\\u064A\\u0627\\u062F\\u0647'], id: 'clinic', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0639\\u064A\\u0627\\u062F\\u0629' },
    { kw: ['\\u0635\\u064A\\u062F\\u0644\\u064A\\u0629', '\\u0635\\u064A\\u062F\\u0644\\u064A\\u0647', '\\u0635\\u064A\\u062F\\u0644\\u064A'], id: 'pharmacy', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0635\\u064A\\u062F\\u0644\\u064A\\u0629' },
    { kw: ['\\u0645\\u062D\\u0637\\u0629 \\u0648\\u0642\\u0648\\u062F', '\\u0628\\u0646\\u0632\\u064A\\u0646', '\\u0648\\u0642\\u0648\\u062F', '\\u0628\\u0646\\u0632\\u064A\\u0646\\u0629'], id: 'fuel', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u062D\\u0637\\u0629 \\u0648\\u0642\\u0648\\u062F' },
    { kw: ['\\u0645\\u0637\\u0639\\u0645', '\\u0623\\u0643\\u0644', '\\u0627\\u0643\\u0644', '\\u0645\\u0637\\u0627\\u0639\\u0645'], id: 'restaurant', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u0637\\u0639\\u0645' },
    { kw: ['\\u0645\\u0642\\u0647\\u0649', '\\u0642\\u0647\\u0648\\u0629', '\\u0643\\u0627\\u0641\\u064A\\u0647', '\\u0643\\u0627\\u0641\\u064A\\u0629'], id: 'cafe', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u0642\\u0647\\u0649' },
    { kw: ['\\u0628\\u0642\\u0627\\u0644\\u0629', '\\u0628\\u0642\\u0627\\u0644\\u0647', '\\u0633\\u0648\\u0628\\u0631'], id: 'supermarket', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0628\\u0642\\u0627\\u0644\\u0629' },
    { kw: ['\\u0645\\u0633\\u062C\\u062F', '\\u062C\\u0627\\u0645\\u0639'], id: 'mosque', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u0633\\u062C\\u062F' },
    { kw: ['\\u0645\\u062F\\u0631\\u0633\\u0629', '\\u0645\\u062F\\u0631\\u0633\\u0647'], id: 'school', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u062F\\u0631\\u0633\\u0629' },
    { kw: ['\\u0645\\u0635\\u0631\\u0641', '\\u0628\\u0646\\u0643'], id: 'bank', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u0635\\u0631\\u0641' },
    { kw: ['\\u0635\\u0631\\u0627\\u0641', '\\u0627\\u062A\\u0645'], id: 'atm', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0635\\u0631\\u0627\\u0641' },
    { kw: ['\\u0645\\u0648\\u0642\\u0641', '\\u0628\\u0627\\u0631\\u0643\\u0646'], id: 'parking', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0645\\u0648\\u0642\\u0641' },
    { kw: ['\\u0641\\u0646\\u062F\\u0642'], id: 'hotel', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0641\\u0646\\u062F\\u0642' },
    { kw: ['\\u0633\\u0648\\u0642'], id: 'market', say: '\\u0623\\u0628\\u062D\\u062B \\u0639\\u0646 \\u0623\\u0642\\u0631\\u0628 \\u0633\\u0648\\u0642' },
  ];

  for (const entry of nearbyMap) {
    for (const kw of entry.kw) {
      if (text.includes(kw)) {
        if (typeof onNearbySearch !== 'function') {
          say('\\u0627\\u0644\\u0628\\u062D\\u062B \\u063A\\u064A\\u0631 \\u0645\\u062A\\u0627\\u062D')
          return
        }
        say(entry.say)
        setTimeout(() => { onNearbySearch(entry.id) }, 1200)
        return
      }
    }
  }

  // start trip
`;

// أدخلها قبل "// start trip"
const marker = "  // start trip\r\n";
const markerLF = "  // start trip\n";

if (v.includes(marker)) {
  v = v.replace(marker, nearbyBlock);
  console.log('NEARBY: INSERTED (CRLF)');
} else if (v.includes(markerLF)) {
  v = v.replace(markerLF, nearbyBlock);
  console.log('NEARBY: INSERTED (LF)');
} else {
  console.log('NEARBY: NO_MATCH');
}

fs.writeFileSync(vPath, v, 'utf8');
console.log('DONE');