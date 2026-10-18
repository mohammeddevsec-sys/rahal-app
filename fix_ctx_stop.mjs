import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// 1. حقن onStopTrip في الكائن المرسل للدالة
c = c.replace(
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })",
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch })"
);

// 2. حقن onStopTrip في تفكيك الكائن داخل الدالة
c = c.replace(
  "const { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch } = ctx",
  "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch } = ctx"
);

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');