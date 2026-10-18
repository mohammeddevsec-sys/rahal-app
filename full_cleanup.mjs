import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. استبدال دالة الصوت بالكامل
const voiceRegex = /submitReport: async \(type, gps\) => \{[\s\S]*?setReports\(\(prev\) => \[\.\.\.prev, rep\]\)\s*\}/;
const cleanVoice = `submitReport: async (type, gps) => {
        const now = Date.now()
        if (lastReportRef.current.type === type && now - lastReportRef.current.time < 15000) {
          console.log('DUPLICATE_VOICE_BLOCKED:', type)
          return
        }
        lastReportRef.current = { type, time: now }

        const rep = await addReport(type, gps)
        setUserStats(prev => addPoints(3, prev))
        setShowPointsPopup(true)
        setTimeout(() => setShowPointsPopup(false), 2500)
        setReports((prev) => [...prev, rep])
      }`;
if (voiceRegex.test(c)) {
  c = c.replace(voiceRegex, cleanVoice);
  console.log('VOICE_SUBMIT: CLEANED');
}

// 2. استبدال دالة الإضافة اليدوية بالكامل
const manualRegex = /const handleAddReport = useCallback\(async \(typeId, coords\) => \{[\s\S]*?\}, \[[^\]]*\]\)/;
const cleanManual = `const handleAddReport = useCallback(async (typeId, coords) => {
    const map = mapRef.current
    if (!map) return
    const center = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'
      ? { lat: coords.lat, lng: coords.lng }
      : (location
        ? { lat: location.lat, lng: location.lng }
        : { lat: map.getCenter().lat, lng: map.getCenter().lng })

    const now = Date.now()
    if (lastReportRef.current.type === typeId && now - lastReportRef.current.time < 15000) {
      console.log('DUPLICATE_MANUAL_BLOCKED:', typeId)
      return
    }
    lastReportRef.current = { type: typeId, time: now }

    const rep = await addReport(typeId, center)
    setUserStats(prev => addPoints(3, prev))
    setShowPointsPopup(true)
    setTimeout(() => setShowPointsPopup(false), 2500)
    setReports((prev) => [...prev, rep])
  }, [location])`;
if (manualRegex.test(c)) {
  c = c.replace(manualRegex, cleanManual);
  console.log('HANDLE_ADD: CLEANED');
}

fs.writeFileSync(f, c, 'utf8');
console.log('FULL_CLEANUP_DONE');