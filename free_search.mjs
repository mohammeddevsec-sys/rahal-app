import fs from 'fs';

// ===== 1. voiceControl.js =====
const vf = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vf, 'utf8');

// 1a. أضف onFreeSearch للتوقيع
v = v.replace(
  "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onStateChange }) {",
  "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch, onStateChange }) {"
);

// 1b. مرر في executeVoiceCommand
v = v.replace(
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch })",
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })"
);

v = v.replace(
  "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch }) {",
  "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch }) {"
);

// 1c. أضف كتلة البحث الحر قبل "// start trip"
const freeSearchBlock = `  // free-text search via Nominatim: "ابحث عن X" / "وين X" / "دور X"
  const freeTriggers = [
    '\\u0627\\u0628\\u062D\\u062B \\u0639\\u0646',
    '\\u0627\\u0628\\u062D\\u062B \\u0644\\u064A',
    '\\u0648\\u064A\\u0646',
    '\\u062F\\u0648\\u0631',
    '\\u0634\\u0648\\u0641 \\u0644\\u064A',
    '\\u0648\\u062F\\u0646\\u064A',
    '\\u0627\\u0630\\u0647\\u0628 \\u0625\\u0644\\u0649',
    '\\u0627\\u0631\\u0648\\u062D',
  ];
  for (const trig of freeTriggers) {
    if (text.includes(trig)) {
      const query = text.substring(text.indexOf(trig) + trig.length).trim();
      if (query.length >= 2) {
        if (typeof onFreeSearch !== 'function') {
          say('\\u0627\\u0644\\u0628\\u062D\\u062B \\u063A\\u064A\\u0631 \\u0645\\u062A\\u0627\\u062D')
          return
        }
        say('\\u062C\\u0627\\u0631\\u064A \\u0627\\u0644\\u0628\\u062D\\u062B \\u0639\\u0646 ' + query)
        setTimeout(() => { onFreeSearch(query) }, 1400)
        return
      }
    }
  }

  // start trip
`;

const marker = "  // start trip\r\n";
const markerLF = "  // start trip\n";

if (v.includes(marker)) {
  v = v.replace(marker, freeSearchBlock);
  console.log('VOICE: free-search block ADDED (CRLF)');
} else if (v.includes(markerLF)) {
  v = v.replace(markerLF, freeSearchBlock);
  console.log('VOICE: free-search block ADDED (LF)');
} else {
  console.log('VOICE: start-trip marker NOT FOUND');
}

fs.writeFileSync(vf, v, 'utf8');

// ===== 2. App.jsx =====
const af = 'D:/RAHAL/src/App.jsx';
let a = fs.readFileSync(af, 'utf8');

// 2a. أضف handleVoiceFreeSearch قبل handleVoiceClick
const anchor = "  const handleVoiceClick = useCallback(() => {";
if (!a.includes(anchor)) {
  console.log('APP: handleVoiceClick NOT FOUND');
  process.exit(1);
}

const freeHandler = `  const handleVoiceFreeSearch = useCallback(async (query) => {
    const requestId = ++searchRequestRef.current
    setSearchQuery(query)
    setSearchStatus('loading')
    setShowResults(true)
    setSearchResults([])
    try {
      const results = await searchPlaces(query)
      if (requestId !== searchRequestRef.current) return
      setSearchResults(results)
      setSearchStatus(results.length === 0 ? 'empty' : 'done')
      const map = mapRef.current
      if (map && results.length > 0) {
        map.flyTo({ center: [results[0].lng, results[0].lat], zoom: 14, duration: 1500 })
      }
    } catch (err) {
      if (requestId !== searchRequestRef.current) return
      console.error('voice free search failed:', err)
      setSearchStatus('error')
    }
  }, [])

`;

a = a.replace(anchor, freeHandler + anchor);
console.log('APP: handleVoiceFreeSearch ADDED');

// 2b. مرر onFreeSearch في toggleVoiceControl
const oldCall = "      onNearbySearch: handlePickCategory,\r\n      onStateChange: setIsMicListening,";
const oldCallLF = "      onNearbySearch: handlePickCategory,\n      onStateChange: setIsMicListening,";

if (a.includes(oldCall)) {
  a = a.replace(oldCall, "      onNearbySearch: handlePickCategory,\r\n      onFreeSearch: handleVoiceFreeSearch,\r\n      onStateChange: setIsMicListening,");
  console.log('APP: onFreeSearch WIRED (CRLF)');
} else if (a.includes(oldCallLF)) {
  a = a.replace(oldCallLF, "      onNearbySearch: handlePickCategory,\n      onFreeSearch: handleVoiceFreeSearch,\n      onStateChange: setIsMicListening,");
  console.log('APP: onFreeSearch WIRED (LF)');
} else {
  console.log('APP: onNearbySearch marker NOT FOUND');
}

// 2c. أضف handleVoiceFreeSearch للـ deps
a = a.replace(
  "  }, [routeInfo, startTrip, handlePickCategory])",
  "  }, [routeInfo, startTrip, handlePickCategory, handleVoiceFreeSearch])"
);

fs.writeFileSync(af, a, 'utf8');
console.log('DONE');