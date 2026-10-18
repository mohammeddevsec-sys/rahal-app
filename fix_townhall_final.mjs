import fs from 'fs';
const f = 'D:/RAHAL/src/lib/maplibreMap.js';
let c = fs.readFileSync(f, 'utf8');

const fixCode = `
  // Silence missing sprite image warnings (e.g. townhall)
  if (typeof map.setMissingStyleImageResolver === 'function') {
    map.setMissingStyleImageResolver(() => {
      const data = new Uint8Array(4)
      return { width: 1, height: 1, data }
    })
  }
`;

const anchor = '  return { map, isOffline }';
if (c.includes(anchor) && !c.includes('setMissingStyleImageResolver')) {
  c = c.replace(anchor, fixCode + '\n' + anchor);
  fs.writeFileSync(f, c, 'utf8');
  console.log('TOWNHALL_FIX: ADDED_SUCCESSFULLY');
} else if (c.includes('setMissingStyleImageResolver')) {
  console.log('TOWNHALL_FIX: ALREADY_EXISTS_IN_CODE');
} else {
  console.log('TOWNHALL_FIX: ANCHOR_NOT_FOUND');
}