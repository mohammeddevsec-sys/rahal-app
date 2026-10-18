import fs from 'fs';

// ===== 1. إصلاح App.jsx (بدء الرحلة) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// البحث عن دالة startTrip بالكامل واستبدالها
const startTripRegex = /const startTrip = useCallback\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\)/;
const newStartTrip = `const startTrip = useCallback(() => {
    if (!routeInfo) return
    setTripActive(true)
    speakArabic('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')
    typingWarnedRef.current = false
    spokenStepsRef.current = new Set()
    arrivalSpokenRef.current = false

    const dest = destinationRef.current
    if (dest && location) {
      getRoute(
        { lat: location.lat, lng: location.lng },
        { lat: dest.lat, lng: dest.lng },
      ).then((route) => { if (route) applyRoute(route) }).catch(() => {})
    }
    const startMap = mapRef.current
    if (startMap && location) {
      let h = null
      if (typeof location.heading === 'number' && !isNaN(location.heading)) h = location.heading
      else if (routeInfo && routeInfo.steps && routeInfo.steps.length > 0) {
        const firstStep = routeInfo.steps[0]
        if (firstStep.location) {
          const dLat = firstStep.location.lat - location.lat
          const dLng = (firstStep.location.lng - location.lng) * Math.cos(location.lat * Math.PI / 180)
          if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) {
            h = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360
          }
        }
      }
      if (h === null) h = 0
      startMap.easeTo({
        center: [location.lng, location.lat],
        zoom: 17,
        pitch: 60,
        bearing: h,
        padding: { top: 0, bottom: Math.round((startMap.getContainer().clientHeight || 600) * 0.32), left: 0, right: 0 },
        duration: 900,
        essential: true,
      })
    }
  }, [routeInfo, location, applyRoute])`;

if (startTripRegex.test(app)) {
  app = app.replace(startTripRegex, newStartTrip);
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP: START TRIP REWRITTEN');
} else {
  console.log('APP: START TRIP NOT FOUND');
}

// ===== 2. إصلاح voiceControl.js (إلغاء الرحلة) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة أي أثر لـ isMisheard
vc = vc.replace(/const isMisheard = [^;]+;/g, '');
vc = vc.replace(/\s*\|\|\s*isMisheard/g, '');

// البحث عن بلوك الإلغاء واستبداله بالكامل
const cancelBlockRegex = /if\s*\(cancelRegex\.test\(text\)\)\s*\{[\s\S]*?return;\s*\}/;
const newCancelBlock = `if (cancelRegex.test(text)) {
      console.log('CANCEL_TRIP_TRIGGERED:', text);
      if (typeof onStopTrip === 'function') {
        onStopTrip();
        setTimeout(() => {
          speakArabicViaServer('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
        }, 1200);
      }
      return;
    }`;

if (cancelBlockRegex.test(vc)) {
  vc = vc.replace(cancelBlockRegex, newCancelBlock);
  console.log('VOICE: CANCEL BLOCK REWRITTEN');
} else {
  console.log('VOICE: CANCEL BLOCK NOT FOUND');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');