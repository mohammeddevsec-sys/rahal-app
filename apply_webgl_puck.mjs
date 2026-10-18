import fs from 'fs';
const path = "D:/RAHAL";

// ===== 1. إنشاء ملف صورة السهم (SVG) =====
const svgContent = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wazeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.4)" />
    </filter>
    <linearGradient id="wazeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#00e5ff" />
      <stop offset="100%" stop-color="#0097a7" />
    </linearGradient>
  </defs>
  <path d="M50 10 L88 85 L50 65 L12 85 Z" fill="url(#wazeGrad)" stroke="#ffffff" stroke-width="7" stroke-linejoin="round" filter="url(#wazeShadow)" />
</svg>`;
fs.writeFileSync(`${path}/public/arrow.svg`, svgContent, 'utf8');

// ===== 2. تعديل App.jsx =====
const appPath = `${path}/src/App.jsx`;
let app = fs.readFileSync(appPath, 'utf8');

// أ) إزالة كود HTML Marker القديم واستبداله بـ WebGL Source & Layer
const oldMarkerRegex = /const el = document\.createElement\('div'\)\s*el\.className = 'user-marker'[\s\S]*?localMarker = new Marker\(\{[\s\S]*?markerRef\.current = localMarker/;
const newLayerCode = `map.loadImage('/arrow.svg', (error, image) => {
          if (error) return
          map.addImage('puck-image', image)
          map.addSource('car-location', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: DEFAULT_CENTER }, properties: { bearing: 0 } }] }
          })
          map.addLayer({
            id: 'puck-layer',
            type: 'symbol',
            source: 'car-location',
            layout: {
              'icon-image': 'puck-image',
              'icon-size': 0.8,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-rotate': ['get', 'bearing'],
              'icon-rotation-alignment': 'map',
              'icon-pitch-alignment': 'map'
            }
          })
        })
        markerRef.current = true;`;

if (oldMarkerRegex.test(app)) {
  app = app.replace(oldMarkerRegex, newLayerCode);
  console.log('APP: HTML Marker removed, WebGL Layer added.');
}

// ب) تحديث طريقة تحريك السهم (GPS / Simulation)
// نبحث عن الكود الذي كان يحدث إحداثيات الـ Marker ونستبدله بتحديث بيانات الـ Source
const setPosRegex = /markerRef\.current\.setLngLat\(\[sm\.lng, sm\.lat\]\)[\s\S]*?setMarkerRotation\(sm\.heading\)/;
const newSetPos = `const src = map.getSource('car-location');
      if (src) {
        src.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [sm.lng, sm.lat] }, properties: { bearing: sm.heading || 0 } }] });
      }`;
app = app.replace(setPosRegex, newSetPos);

// ج) تحديث الكود في __rahalSetPos
app = app.replace(
  /markerTargetRef\.current\.lng = lng[\s\S]*?markerTargetRef\.current\.lat = lat[\s\S]*?markerTargetRef\.current\.heading = heading/,
  `markerTargetRef.current.lng = lng
      markerTargetRef.current.lat = lat
      markerTargetRef.current.heading = heading
      const map = mapRef.current;
      if (map && map.getSource('car-location')) {
        map.getSource('car-location').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { bearing: heading } }] });
      }`
);

// د) التأكد من إضافة الـ pitch للكاميرا عند بدء الرحلة
app = app.replace(/pitch:\s*60/g, "pitch: 60"); // تأكيد وجودها

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: Source update logic patched.');

// ===== 3. تنظيف CSS القديم للسهم =====
const cssPath = `${path}/src/App.css`;
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/\/\* ===== WAZE 3D PUCK ===== \*\/[\s\S]*$/g, ''); // إزالة تنسيقات الـ user-marker القديمة
fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS: Old marker styles removed.');