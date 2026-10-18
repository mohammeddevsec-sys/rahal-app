import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// البحث عن دالة startTrip واسترجاع النطق
const idx = c.indexOf('const startTrip = useCallback');
if (idx === -1) { console.log('NOT_FOUND'); process.exit(1); }
const endIdx = c.indexOf('}, [', idx);
const body = c.substring(idx, endIdx);

console.log('--- CURRENT startTrip BODY ---');
console.log(body.substring(0, 500));
console.log('--- END ---');