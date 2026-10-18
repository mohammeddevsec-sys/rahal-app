import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// البحث عن دالة handleAddReport باستخدام Regex مرن
const funcRegex = /const handleAddReport = useCallback\(async \(typeId, coords\) => \{([\s\S]*?)const rep = await addReport\(typeId, coords\)/;

if (funcRegex.test(c)) {
  c = c.replace(funcRegex, `const handleAddReport = useCallback(async (typeId, coords) => {$1
    // DEDUPLICATION LOGIC
    const now = Date.now()
    const rLat = Math.round(coords.lat * 10000) / 10000
    const rLng = Math.round(coords.lng * 10000) / 10000
    if (
      lastReportRef.current.type === typeId &&
      lastReportRef.current.lat === rLat &&
      lastReportRef.current.lng === rLng &&
      now - lastReportRef.current.time < 15000
    ) {
      console.log('DUPLICATE_MANUAL_SKIPPED:', typeId)
      return
    }
    lastReportRef.current = { type: typeId, lat: rLat, lng: rLng, time: now }

    const rep = await addReport(typeId, coords)`);
  fs.writeFileSync(f, c, 'utf8');
  console.log('HANDLE_ADD: DEDUP ADDED SUCCESSFULLY');
} else {
  console.log('HANDLE_ADD: REGEX FAILED - SHOWING SNIPPET');
  const idx = c.indexOf('const handleAddReport');
  if (idx !== -1) console.log(c.substring(idx, idx + 300));
}