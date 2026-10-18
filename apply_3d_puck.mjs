import fs from 'fs';

// ===== 1. تحديث إعدادات السهم في App.jsx (3D Rotation) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// أ) تحديث إنشاء السهم ليلتف مع الخريطة (Map Rotation)
app = app.replace(
  "localMarker = new Marker({ element: el, anchor: 'center', rotationAlignment: 'viewport' })",
  "localMarker = new Marker({ element: el, anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' })"
);

// ب) تحديث إعدادات الكاميرا (Pitch 60 + Bearing + Zoom 17.5) عند بدء الرحلة
// نبحث عن startMap.easeTo
app = app.replace(
  /startMap\.easeTo\(\{[\s\S]*?\}\);/,
  `startMap.easeTo({
        center: [location.lng, location.lat],
        zoom: 17.5,
        pitch: 60,
        bearing: h,
        padding: { top: 0, bottom: Math.round((startMap.getContainer().clientHeight || 600) * 0.32), left: 0, right: 0 },
        duration: 900,
        essential: true,
      });`
);

// ج) تحديث إعدادات الكاميرا أثناء السير (useEffect)
app = app.replace(
  /map\.easeTo\(\{[\s\S]*?essential: true,\s*\}\);/,
  `map.easeTo({
      center: [location.lng, location.lat],
      zoom: 17.5,
      pitch: 60,
      bearing: heading,
      padding: { top: 0, bottom: Math.round((map.getContainer().clientHeight || 600) * 0.32), left: 0, right: 0 },
      duration: 800,
      essential: true,
    });`
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP_JSX: 3D CAMERA & MAP ROTATION APPLIED');

// ===== 2. تحديث حجم السهم في App.css (64px) =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إزالة أي قواعد قديمة لحجم السهم
css = css.replace(/\.user-marker\s*\{[^}]*width:[^;]+;[^}]*height:[^;]+;[^}]*\}/g, '');
css = css.replace(/\.user-marker\s+svg\s*\{[^}]*\}/g, '');

// إضافة القاعدة الجديدة بحجم 64px
const newMarkerCss = `

/* ===== WAZE 3D PUCK ===== */
.user-marker {
  width: 64px !important;
  height: 64px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10 !important;
  transition: transform 0.2s ease-out !important;
}
.user-marker svg {
  width: 100% !important;
  height: 100% !important;
  filter: drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.4)) !important;
}
`;
fs.writeFileSync(cssPath, css + newMarkerCss, 'utf8');
console.log('APP_CSS: ARROW RESIZED TO 64px');