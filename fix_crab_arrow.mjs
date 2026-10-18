import fs from 'fs';

// ===== 1. أخذ نسخة احتياطية على E قبل التعديل =====
const destE = 'E:/RAHAL_GOLDEN_BEFORE_HEADING_FIX_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
fs.cpSync('D:/RAHAL/server', destE + '/server', { recursive: true });
fs.cpSync('D:/RAHAL/public', destE + '/public', { recursive: true });
console.log('BACKUP_E_OK');

// ===== 2. تعديل App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// أ) دالة لحساب زاوية الشارع (Bearing) من المسار
const bearingFunc = `
  const getRouteBearing = (loc, coords) => {
    if (!coords || coords.length < 2) return loc.heading || 0;
    let minDist = Infinity;
    let bestHeading = loc.heading || 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i], b = coords[i+1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len2 = dx*dx + dy*dy;
      let t = len2 > 0 ? ((loc.lng - a[0])*dx + (loc.lat - a[1])*dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const projLng = a[0] + t * dx;
      const projLat = a[1] + t * dy;
      const dist = (loc.lng - projLng)**2 + (loc.lat - projLat)**2;
      if (dist < minDist) {
        minDist = dist;
        const ddx = (b[0] - a[0]) * Math.cos(projLat * Math.PI/180);
        const ddy = b[1] - a[1];
        bestHeading = (Math.atan2(ddx, ddy) * 180 / Math.PI + 360) % 360;
      }
    }
    return bestHeading;
  };
`;

// حقن الدالة قبل useEffect
if (!app.includes('getRouteBearing')) {
  app = app.replace('useEffect(() => {', bearingFunc + '\n  useEffect(() => {');
}

// ب) استخدام زاوية الشارع في تحديث السهم (GPS useEffect)
const markerUpdateRegex = /if \(markerRef\.current\) \{\s*markerRef\.current\.setLngLat\(\[lng, lat\]\)\s*if \(typeof heading === 'number' && !isNaN\(heading\)\) setMarkerRotation\(heading\)\s*\}/;
const newMarkerUpdate = `if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
        const g = routeInfo?.geometry || routeInfo?.coords;
        const coords = Array.isArray(g) ? g : (g && g.coordinates);
        let finalHeading = heading;
        if (coords) {
          finalHeading = getRouteBearing({lat, lng}, coords);
        }
        if (typeof finalHeading === 'number' && !isNaN(finalHeading)) setMarkerRotation(finalHeading)
      }`;
app = app.replace(markerUpdateRegex, newMarkerUpdate);

// ج) استخدام زاوية الشارع في الكاميرا (Camera useEffect)
const cameraLogicRegex = /let heading = map\.getBearing\(\);[\s\S]*?const paddingBottom =/;
const newCameraLogic = `const g = routeInfo?.geometry || routeInfo?.coords;
    const coords = Array.isArray(g) ? g : (g && g.coordinates);
    let heading = location.heading;
    if (coords) {
      heading = getRouteBearing(location, coords);
    } else if (typeof heading !== 'number' || isNaN(heading)) {
      heading = map.getBearing();
    }
    
    const paddingBottom =`;

if (cameraLogicRegex.test(app)) {
  app = app.replace(cameraLogicRegex, newCameraLogic);
}

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: HEADING FIXED');