import fs from 'fs';
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// ===== 1. إصلاح ألوان المسار (بنفسجي) =====
app = app.replace(/'line-color': '#b899f0'/g, "'line-color': '#a885f5'");
app = app.replace(/'line-color': '#6b1ec7'/g, "'line-color': '#7a12d6'");
app = app.replace(/'line-color': '#162e1a'/g, "'line-color': '#a885f5'");
app = app.replace(/'line-color': '#2ecc71'/g, "'line-color': '#7a12d6'");

// ===== 2. إضافة دالة الإسقاط (Snapping) والكاميرا 3D =====
const snapFunction = `
  const getSnappedLocation = (loc, routeCoords) => {
    if (!routeCoords || routeCoords.length < 2) return { lng: loc.lng, lat: loc.lat, heading: loc.heading || 0 };
    let bestDist = Infinity;
    let bestLat = loc.lat, bestLng = loc.lng;
    let bestHeading = loc.heading || 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const a = routeCoords[i];
      const b = routeCoords[i+1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len2 = dx*dx + dy*dy;
      let t = len2 > 0 ? ((loc.lng - a[0])*dx + (loc.lat - a[1])*dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const projLng = a[0] + t * dx;
      const projLat = a[1] + t * dy;
      const dist = (loc.lng - projLng)**2 + (loc.lat - projLat)**2;
      if (dist < bestDist) {
        bestDist = dist;
        bestLng = projLng;
        bestLat = projLat;
        const ddx = (b[0] - a[0]) * Math.cos(projLat * Math.PI/180);
        const ddy = b[1] - a[1];
        bestHeading = (Math.atan2(ddx, ddy) * 180 / Math.PI + 360) % 360;
      }
    }
    return { lng: bestLng, lat: bestLat, heading: bestHeading };
  };
`;

// حقن الدالة قبل useEffect الخاصة بالكاميرا
if (!app.includes('getSnappedLocation')) {
  app = app.replace('useEffect(() => {', snapFunction + '\n  useEffect(() => {');
}

// ===== 3. تعديل الكاميرا لتستخدم الإسقاط (Snapping) و 3D =====
const cameraRegex = /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!tripActive\s*\|\|\s*!location\)\s*return;[\s\S]*?\}, \[tripActive, location, nextStep\]\);/;
const newCamera = `useEffect(() => {
    if (!tripActive || !location) return;
    const map = mapRef.current;
    if (!map) return;

    const g = routeInfo?.geometry || routeInfo?.coords;
    const coords = Array.isArray(g) ? g : (g && g.coordinates);
    
    const snapped = getSnappedLocation(location, coords);
    
    const paddingBottom = Math.round((map.getContainer().clientHeight || 600) * 0.35);

    map.easeTo({
      center: [snapped.lng, snapped.lat],
      zoom: 17,
      pitch: 60,
      bearing: snapped.heading,
      padding: { top: 0, bottom: paddingBottom, left: 0, right: 0 },
      duration: 800,
      essential: true,
    });
    
    // تحديث موقع السهم (الماركر) ليكون على المسار
    if (markerRef.current) {
      markerRef.current.setLngLat([snapped.lng, snapped.lat]);
      setMarkerRotation(snapped.heading);
    }
  }, [tripActive, location, routeInfo, nextStep]);`;

if (cameraRegex.test(app)) {
  app = app.replace(cameraRegex, newCamera);
} else {
  // كود احتياطي إذا لم يجد الدالة القديمة
  app = app.replace(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?map\.easeTo\(\{[\s\S]*?\}\);[\s\S]*?\}, \[tripActive, location\]\);/, newCamera);
}

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: SNAPPING & 3D & PURPLE ROUTE APPLIED');

// ===== 4. الشريط الأسود والبطاقة البيضاء =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/\/\* ===== DARK TEXT FOR NAV TOP \(transparent bg\) ===== \*\/[\s\S]*?\/\* ===== WAZE VISUAL IDENTITY OVERRIDES ===== \*\//g, '');

const wazeCss = `
.nav-waze-top { background: #000000 !important; color: #fff !important; border-radius: 0 0 16px 16px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
.nav-waze-top * { color: #fff !important; text-shadow: none !important; }
.nav-waze-sheet { background: #ffffff !important; border-radius: 24px 24px 0 0 !important; box-shadow: 0 -4px 16px rgba(0,0,0,0.15) !important; }
.nav-waze-sheet * { color: #0f172a !important; }
.nav-waze-fab { background: #ffcc00 !important; color: #000 !important; }
`;
fs.writeFileSync(cssPath, css + wazeCss, 'utf8');
console.log('CSS: WAZE UI APPLIED');