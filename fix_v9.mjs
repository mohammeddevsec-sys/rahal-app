import fs from 'fs';

// ===== 1) زيادة وقت المايك إلى 12 ثانية =====
const vf = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vf, 'utf8');
if (v.includes('const MIC_WINDOW_MS = 4000')) {
  v = v.replace('const MIC_WINDOW_MS = 4000', 'const MIC_WINDOW_MS = 12000');
  fs.writeFileSync(vf, v, 'utf8');
  console.log('MIC_WINDOW_MS: 4000 -> 12000');
}

// ===== 2) إخفاء تحذير townhall =====
const mf = 'D:/RAHAL/src/lib/maplibreMap.js';
let m = fs.readFileSync(mf, 'utf8');

if (!m.includes('setMissingStyleImageResolver')) {
  const fix = `
  // Silence missing sprite image warnings (e.g. townhall)
  if (typeof map.setMissingStyleImageResolver === 'function') {
    map.setMissingStyleImageResolver(() => {
      const data = new Uint8Array(4)
      return { width: 1, height: 1, data }
    })
  }

  return { map, isOffline }
`;
  // نستبدل "return { map, isOffline }" بالإصلاح
  m = m.replace('  return { map, isOffline }', fix);
  fs.writeFileSync(mf, m, 'utf8');
  console.log('TOWNHALL_WARNING: FIXED');
} else {
  console.log('TOWNHALL_WARNING: ALREADY_EXISTS');
}