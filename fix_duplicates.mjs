import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. إضافة ref لتتبع آخر بلاغ ومنع التكرار
if (!c.includes('lastReportRef')) {
  c = c.replace(
    'const mapRef = useRef(null)',
    'const mapRef = useRef(null)\n  const lastReportRef = useRef({ type: null, lat: null, lng: null, time: 0 })'
  );
}

// 2. تعديل دالة الإرسال الصوتي (submitReport)
const voiceRegex = /submitReport: async \(type, gps\) => \{\s*const rep = await addReport\(type, gps\)[\s\S]*?setReports\(\(prev\) => \[\.\.\.prev, rep\]\)\s*\}/;
if (voiceRegex.test(c)) {
  c = c.replace(voiceRegex, `submitReport: async (type, gps) => {
        const now = Date.now()
        const rLat = Math.round(gps.lat * 10000) / 10000
        const rLng = Math.round(gps.lng * 10000) / 10000
        if (
          lastReportRef.current.type === type &&
          lastReportRef.current.lat === rLat &&
          lastReportRef.current.lng === rLng &&
          now - lastReportRef.current.time < 15000
        ) {
          console.log('DUPLICATE_REPORT_SKIPPED:', type)
          return
        }
        lastReportRef.current = { type, lat: rLat, lng: rLng, time: now }
        
        const rep = await addReport(type, gps)
        setUserStats(prev => addPoints(3, prev))
        setShowPointsPopup(true)
        setTimeout(() => setShowPointsPopup(false), 2500)
        setReports((prev) => [...prev, rep])
      }`);
  console.log('VOICE_SUBMIT: DEDUP ADDED');
} else {
  console.log('VOICE_SUBMIT: NOT FOUND');
}

// 3. تعديل دالة الإرسال اليدوي (handleAddReport)
const oldBlock = `
    const rep = await addReport(typeId, coords)
    setUserStats(prev => addPoints(3, prev))
    setShowPointsPopup(true)
    setTimeout(() => setShowPointsPopup(false), 2500)
    setReports((prev) => [...prev, rep])`;

if (c.includes(oldBlock)) {
  const newBlock = `
    const now = Date.now()
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
    
    const rep = await addReport(typeId, coords)
    setUserStats(prev => addPoints(3, prev))
    setShowPointsPopup(true)
    setTimeout(() => setShowPointsPopup(false), 2500)
    setReports((prev) => [...prev, rep])`;
  c = c.replace(oldBlock, newBlock);
  console.log('HANDLE_ADD: DEDUP ADDED');
} else {
  console.log('HANDLE_ADD: NOT FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');