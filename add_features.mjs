import fs from 'fs';

// ===== 1. تحديث maplibreMap.js لدعم الوضع الليلي =====
const mapPath = 'D:/RAHAL/src/lib/maplibreMap.js';
let mapContent = fs.readFileSync(mapPath, 'utf8');

// تحديث دالة recolorLayers لتقبل الوضع
mapContent = mapContent.replace(
  "function recolorLayers(baseLayers) {",
  "function recolorLayers(baseLayers, theme) {"
);
mapContent = mapContent.replace(
  "if (l.type === 'background') return { ...l, paint: { 'background-color': '#f5e8c8' } };",
  "if (l.type === 'background') return { ...l, paint: { 'background-color': theme === 'dark' ? '#1e1e24' : '#f5e8c8' } };"
);
mapContent = mapContent.replace(
  "if (l.type === 'fill') { var id = (l.id || '').toLowerCase(); var nc = null; if (id === 'earth') nc = '#f5e8c8';",
  "if (l.type === 'fill') { var id = (l.id || '').toLowerCase(); var nc = null; if (id === 'earth') nc = theme === 'dark' ? '#1e1e24' : '#f5e8c8';"
);
// إضافة ألوان داكنة للماء والحدائق
mapContent = mapContent.replace(
  "else if (id === 'water' || id.indexOf('water') !== -1) nc = '#74c4ea';",
  "else if (id === 'water' || id.indexOf('water') !== -1) nc = theme === 'dark' ? '#0f2b38' : '#74c4ea';"
);
mapContent = mapContent.replace(
  "else if (id === 'landuse_park' || id === 'landuse_urban_green' || id === 'landuse_zoo') nc = '#98d898';",
  "else if (id === 'landuse_park' || id === 'landuse_urban_green' || id === 'landuse_zoo') nc = theme === 'dark' ? '#1a3325' : '#98d898';"
);

// تحديث استدعاء buildStyle ليمرر الوضع
mapContent = mapContent.replace(
  "export async function initMap(container) {",
  "export async function initMap(container, theme = 'light') {"
);
mapContent = mapContent.replace(
  "layers: recolorLayers(layers('protomaps', namedFlavor('light'), { lang: 'ar' })),",
  "layers: recolorLayers(layers('protomaps', namedFlavor(theme === 'dark' ? 'dark' : 'light'), { lang: 'ar' }), theme),"
);
fs.writeFileSync(mapPath, mapContent, 'utf8');
console.log('MAP: DARK MODE SUPPORT ADDED');

// ===== 2. تحديث App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إضافة حالة الوضع (Theme)
if (!app.includes('const [isDark, setIsDark] = useState')) {
  app = app.replace(
    "const [isMicListening, setIsMicListening] = useState(false)",
    "const [isMicListening, setIsMicListening] = useState(false)\n  const [isDark, setIsDark] = useState(() => localStorage.getItem('rahal-theme') === 'dark')"
  );
}

// تمرير الوضع إلى initMap
app = app.replace("initMap(container).then", "initMap(container, isDark ? 'dark' : 'light').then");

// تحديث زاوية الكاميرا (Pitch 65) في startTrip و useEffect
app = app.replace(/pitch: 60,/g, "pitch: 65,");

// إضافة زر التبديل في الشريط العلوي
const headerAction = '<div className="top-actions">';
const themeBtn = `<div className="top-actions">
          <button type="button" className="theme-btn" onClick={() => { const next = !isDark; setIsDark(next); localStorage.setItem('rahal-theme', next ? 'dark' : 'light'); window.location.reload(); }} aria-label="تغيير الوضع">
            {isDark ? '☀️' : '🌙'}
          </button>`;

if (app.includes(headerAction) && !app.includes('theme-btn')) {
  app = app.replace(headerAction, themeBtn);
}
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: THEME TOGGLE & PITCH 65 ADDED');

// ===== 3. تحديث App.css (زر الوضع) =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.theme-btn')) {
  css += `
/* ===== THEME BUTTON ===== */
.theme-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.theme-btn:hover {
  transform: scale(1.1);
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
}
console.log('CSS: THEME BTN STYLED');