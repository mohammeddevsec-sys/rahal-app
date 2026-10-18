import fs from 'fs';
const app = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');
const map = fs.readFileSync('D:/RAHAL/src/lib/maplibreMap.js', 'utf8');

console.log('--- BUTTON CHECK ---');
console.log(app.includes('theme-btn') ? 'FOUND: Theme Button' : 'MISSING: Theme Button');
console.log('--- PITCH CHECK ---');
console.log(app.includes('pitch: 65') ? 'FOUND: Pitch 65' : 'MISSING: Pitch 65');
console.log('--- MAP THEME CHECK ---');
console.log(map.includes("theme = 'light'") ? 'FOUND: Map Theme Param' : 'MISSING: Map Theme Param');
console.log('--- BUILD STYLE CALL ---');
const idx = map.indexOf('buildStyle(pmtilesUrl');
if (idx !== -1) console.log(map.substring(idx - 50, idx + 100));