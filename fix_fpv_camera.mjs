import fs from 'fs';

// ===== 1. إصلاح دوران السهم والكاميرا في App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// أ) جعل دالة دوران السهم تثبته للأعلى دائماً (0 درجة)
app = app.replace(
  /const setMarkerRotation = \(deg\) => \{[\s\S]*?\}/,
  `const setMarkerRotation = (deg) => {
    const el = markerRef.current && markerRef.current.getElement()
    if (!el) return
    const svg = el.querySelector('svg')
    if (!svg) return
    // السهم يشير للأعلى دائماً (الخريطة هي التي تدور)
    svg.style.transform = 'rotate(0deg)';
  }`
);

// ب) التأكد من أن الكاميرا تميل وتدور مع اتجاه الحركة (Bearing) وتضع السيارة في الأسفل
const cameraRegex = /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!tripActive\s*\|\|\s*!location\)\s*return;[\s\S]*?\}, \[tripActive, location, nextStep\]\);/;
const newCameraLogic = `useEffect(() => {
    if (!tripActive || !location) return;
    const map = mapRef.current;
    if (!map) return;

    let heading = map.getBearing();
    if (typeof location.heading === 'number' && !isNaN(location.heading) && location.heading !== null) {
      heading = location.heading;
    } else if (nextStep && nextStep.location) {
      const dLat = nextStep.location.lat - location.lat;
      const dLng = (nextStep.location.lng - location.lng) * Math.cos(location.lat * Math.PI / 180);
      if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) {
        heading = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
      }
    }

    const paddingBottom = Math.round((map.getContainer().clientHeight || 600) * 0.35);

    map.easeTo({
      center: [location.lng, location.lat],
      zoom: 17,
      pitch: 60,
      bearing: heading,
      padding: { top: 0, bottom: paddingBottom, left: 0, right: 0 },
      duration: 800,
      essential: true,
    });
  }, [tripActive, location, nextStep]);`;

if (cameraRegex.test(app)) {
  app = app.replace(cameraRegex, newCameraLogic);
} else {
  // إزالة الكاميرا القديمة وإضافة الجديدة إذا لم يتطابق النمط
  app = app.replace(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?map\.easeTo\(\{[\s\S]*?\}\);[\s\S]*?\}, \[tripActive, location\]\);/, newCameraLogic);
}
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: FPV CAMERA & FIXED ARROW DIRECTION APPLIED');

// ===== 2. تحسين شكل السهم في App.css (حجم 50px) =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/width:\s*80px\s*!important;/g, 'width: 50px !important;');
css = css.replace(/height:\s*80px\s*!important;/g, 'height: 50px !important;');
fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS: ARROW RESIZED TO 50px');