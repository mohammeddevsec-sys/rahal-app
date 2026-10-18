import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// إضافة سطر تتبع في بداية الدالة
const anchor = "const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx";
const debugLine = anchor + "\n  console.log('DEBUG_EXEC:', JSON.stringify(text), '| tripActive:', tripActive);";

if (c.includes(anchor) && !c.includes('DEBUG_EXEC')) {
  c = c.replace(anchor, debugLine);
  fs.writeFileSync(f, c, 'utf8');
  console.log('DONE');
} else {
  console.log('ALREADY_ADDED_OR_NOT_FOUND');
}