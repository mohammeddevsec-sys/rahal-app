import fs from 'fs';
const f = 'D:/RAHAL/src/lib/maplibreMap.js';
let c = fs.readFileSync(f, 'utf8');

// ابحث عن "return { map, isOffline }" وأضف الحل قبله
const marker = "  return { map, isOffline }";
const markerCR = "  return { map, isOffline }\r\n";

const fix = `  // Silence missing sprite image warnings (e.g. townhall)
  if (typeof map.setMissingStyleImageResolver === 'function') {
    map.setMissingStyleImageResolver(() => {
      const data = new Uint8Array(4)
      return { width: 1, height: 1, data }
    })
  }

  return { map, isOffline }`;

if (c.includes(marker) && !c.includes('setMissingStyleImageResolver')) {
  c = c.replace(marker, fix);
  console.log('FIX: ADDED');
} else if (c.includes('setMissingStyleImageResolver')) {
  console.log('FIX: ALREADY_EXISTS');
} else {
  console.log('FIX: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');