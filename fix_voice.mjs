import fs from 'fs';

// ===== App.jsx: تمرير startTrip =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const oldApp = `getMap: () => mapRef.current,
      setActiveTab,
      submitReport: async (type, gps) => {
        const rep = await addReport(type, gps)
        setReports((prev) => [...prev, rep])
      },
      onStateChange: setIsMicListening,`;

const newApp = `getMap: () => mapRef.current,
      setActiveTab,
      submitReport: async (type, gps) => {
        const rep = await addReport(type, gps)
        setReports((prev) => [...prev, rep])
      },
      onStartTrip: startTrip,
      hasRoute: !!routeInfo,
      onStateChange: setIsMicListening,`;

if (app.includes(oldApp)) {
  app = app.replace(oldApp, newApp);
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: REPLACED');
} else {
  console.log('APP_JSX: NO_MATCH');
}

// ===== voiceControl.js =====
const vPath = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vPath, 'utf8');

// 1) VOICE_INPUT log + HAS_ROUTE
const oldLog = "  const map = getMap ? getMap() : null\n";
const newLog = "  const map = getMap ? getMap() : null\n  console.log('VOICE_INPUT:', JSON.stringify(text))\n  console.log('HAS_ROUTE:', hasRoute)\n";
if (v.includes(oldLog)) {
  v = v.replace(oldLog, newLog);
  console.log('VOICE_INPUT_LOG: ADDED');
} else {
  console.log('VOICE_INPUT_LOG: NO_MATCH (trying \\r\\n)');
  v = v.replace("  const map = getMap ? getMap() : null\r\n", newLog);
}

// 2) start trip block قبل reports
const startTripBlock = `  // start trip
  if (text.includes('\\u0627\\u0628\\u062F\\u0623') || text.includes('\\u0627\\u0628\\u062F\\u0627') || text.includes('\\u0627\\u0628\\u062F\\u064A') || text.includes('\\u0645\\u0634\\u064A\\u0646\\u0627') || text.includes('\\u064A\\u0644\\u0627 \\u0631\\u0648\\u062D')) {
    if (!hasRoute) {
      say('\\u062D\\u062F\\u062F \\u0648\\u062C\\u0647\\u0629 \\u0623\\u0648\\u0644\\u0627\\u064B')
      return
    }
    if (typeof onStartTrip === 'function') {
      onStartTrip()
      say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u062F \\u0628\\u062D\\u0630\\u0631')
    }
    return
  }

`;

// ابحث عن "let type = null" وأدرج قبله
const typeMarker = "  let type = null\n";
const typeMarkerCR = "  let type = null\r\n";

if (v.includes(typeMarker)) {
  v = v.replace(typeMarker, startTripBlock + typeMarker);
  console.log('START_TRIP: ADDED (LF)');
} else if (v.includes(typeMarkerCR)) {
  v = v.replace(typeMarkerCR, startTripBlock + typeMarkerCR);
  console.log('START_TRIP: ADDED (CRLF)');
} else {
  console.log('START_TRIP: NO_MATCH');
}

fs.writeFileSync(vPath, v, 'utf8');
console.log('DONE');