import fs from 'fs';

// 1. نسخة احتياطية على E
const destE = 'E:/RAHAL_GOLDEN_BEFORE_VISUAL_FIX_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
fs.cpSync('D:/RAHAL/server', destE + '/server', { recursive: true });
fs.cpSync('D:/RAHAL/public', destE + '/public', { recursive: true });
console.log('BACKUP_E_OK');

// 2. إصلاح App.jsx
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// أ) إضافة دالة التثبيت على المسار (Snapping)
if (!app.includes('getSnappedLocation')) {
    const snapFunc = `
  const getSnappedLocation = (loc, coords) => {
    if (!coords || coords.length < 2) return { lng: loc.lng, lat: loc.lat, heading: loc.heading || 0 };
    let bestDist = Infinity;
    let bestLng = loc.lng, bestLat = loc.lat;
    let bestHeading = loc.heading || 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i], b = coords[i+1];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const len2 = dx*dx + dy*dy;
      let t = len2 > 0 ? ((loc.lng - a[0])*dx + (loc.lat - a[1])*dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const projLng = a[0] + t * dx, projLat = a[1] + t * dy;
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
    app = app.replace('useEffect(() => {', snapFunc + '\n  useEffect(() => {');
}

// ب) استخدام التثبيت (Snapping) وتغيير شكل السهم (Waze Arrow)
const markerUpdateRegex = /if \(markerRef\.current\) \{\s*markerRef\.current\.setLngLat\(\[lng, lat\]\)[\s\S]*?setMarkerRotation\([^)]+\)\s*\}/;
const newMarkerUpdate = `if (markerRef.current) {
        const g = routeInfo?.geometry || routeInfo?.coords;
        const coords = Array.isArray(g) ? g : (g && g.coordinates);
        const snapped = getSnappedLocation({ lng, lat, heading }, coords);
        markerRef.current.setLngLat([snapped.lng, snapped.lat])
        setMarkerRotation(snapped.heading)
      }`;
app = app.replace(markerUpdateRegex, newMarkerUpdate);

// تحديث شكل السهم ليكون سهم Waze
const svgRegex = /el\.innerHTML = '<svg viewBox="0 0 48 48"[\s\S]*?<\/svg>'/;
const newSvg = `el.innerHTML = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 5 L90 90 L50 75 L10 90 Z" fill="#00d2d3" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/></svg>'`;
app = app.replace(svgRegex, newSvg);

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP_JSX_UPDATED');

// 3. إصلاح CSS (جعل الخلفيات صريحة، وتكبير مؤشر السرعة ووضعه في المنتصف)
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

const cssFix = `
/* ===== FINAL VISUAL OVERRIDES ===== */
.nav-waze-top {
  background: #000000 !important;
  opacity: 1 !important;
}
.nav-waze-sheet {
  background: #ffffff !important;
  opacity: 1 !important;
}
.nav-waze-speed {
  background: #1e1e24 !important;
  opacity: 1 !important;
  border: 4px solid #ffffff !important;
  width: 80px !important;
  height: 80px !important;
  bottom: 160px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
}
.nav-waze-speed-value {
  font-size: 28px !important;
  font-weight: 900 !important;
  color: #ffffff !important;
}
.nav-waze-speed-unit {
  font-size: 12px !important;
  color: #ffffff !important;
}
`;

css = css.replace(/\/\* ===== FINAL VISUAL OVERRIDES ===== \*\/[\s\S]*$/g, '');
css += cssFix;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS_FIXED');