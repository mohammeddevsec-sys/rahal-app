import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// 1) أضف متغير dialog state في الأعلى
if (!c.includes('let pendingReport')) {
  c = c.replace(
    "let lastCommandAt = 0",
    "let lastCommandAt = 0\nlet pendingReport = null\nlet lastLocation = null\nlet lastHeading = 0"
  );
  changes++;
  console.log('STATE_VARS: ADDED');
}

// 2) أضف دالة reopenMic + حساب الموقع
const helpers = `

function computeReportLocation(meters, direction) {
  if (!lastLocation) return null
  const lat = lastLocation.lat
  const lng = lastLocation.lng
  let heading = lastHeading || 0
  if (direction === 'behind') heading = (heading + 180) % 360
  const R = 6371000
  const bearingRad = heading * Math.PI / 180
  const dLat = (meters / R) * (180 / Math.PI)
  const dLng = (meters / (R * Math.cos(lat * Math.PI / 180))) * (180 / Math.PI)
  const newLat = lat + dLat * Math.cos(bearingRad)
  const newLng = lng + dLng * Math.sin(bearingRad)
  return { lat: newLat, lng: newLng }
}
`;

// أدخل الدالة قبل "async function executeVoiceCommand"
const marker = "async function executeVoiceCommand(text, ctx) {";
if (c.includes(marker)) {
  c = c.replace(marker, helpers + "\n" + marker);
  changes++;
  console.log('HELPER: ADDED');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);