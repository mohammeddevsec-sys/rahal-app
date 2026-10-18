import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// التحقق مما إذا كان كود منع التكرار قد أُضيف مسبقاً
if (!c.includes("DUPLICATE_REPORT_SKIPPED:', typeId")) {
  const target = "const rep = await addReport(typeId, coords)";
  
  if (c.includes(target)) {
    const dedupCode = `const now = Date.now()
    const rLat = Math.round(coords.lat * 10000) / 10000
    const rLng = Math.round(coords.lng * 10000) / 10000
    if (
      lastReportRef.current.type === typeId &&
      lastReportRef.current.lat === rLat &&
      lastReportRef.current.lng === rLng &&
      now - lastReportRef.current.time < 15000
    ) {
      console.log('DUPLICATE_REPORT_SKIPPED:', typeId)
      return
    }
    lastReportRef.current = { type: typeId, lat: rLat, lng: rLng, time: now }
    
    `;
    c = c.replace(target, dedupCode + target);
    fs.writeFileSync(f, c, 'utf8');
    console.log('HANDLE_ADD: DEDUP ADDED SUCCESSFULLY');
  } else {
    console.log('HANDLE_ADD: TARGET NOT FOUND');
  }
} else {
  console.log('HANDLE_ADD: ALREADY HAS DEDUP');
}