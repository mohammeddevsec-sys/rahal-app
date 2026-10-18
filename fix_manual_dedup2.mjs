import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// نبحث عن بداية استدعاء addReport داخل دالة الإضافة اليدوية
const target = "const rep = await addReport(typeId,";

if (c.includes(target) && !c.includes("DUPLICATE_MANUAL_SKIPPED")) {
  const dedupCode = `const now = Date.now()
    const rLat = Math.round(center.lat * 10000) / 10000
    const rLng = Math.round(center.lng * 10000) / 10000
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

    `;
  
  c = c.replace(target, dedupCode + target);
  fs.writeFileSync(f, c, 'utf8');
  console.log('HANDLE_ADD: DEDUP ADDED SUCCESSFULLY');
} else if (c.includes("DUPLICATE_MANUAL_SKIPPED")) {
  console.log('HANDLE_ADD: ALREADY HAS DEDUP');
} else {
  console.log('HANDLE_ADD: TARGET NOT FOUND');
}