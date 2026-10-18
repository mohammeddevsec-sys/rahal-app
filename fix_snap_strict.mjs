import fs from 'fs';

// 1. نسخة احتياطية
const destE = 'E:/RAHAL_GOLDEN_BEFORE_SNAP_FIX_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
console.log('BACKUP_E_OK');

const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// 2. إجبار السهم على الالتصاق بالمسار (Snapping)
// نبحث عن الكود الذي يحدث الـ marker ونستبدله بـ Snap
const oldMarkerUpdate = "if (markerRef.current) {\n        markerRef.current.setLngLat([lng, lat])";
const newMarkerUpdate = `if (markerRef.current) {
        const g = routeInfo?.geometry || routeInfo?.coords;
        const coords = Array.isArray(g) ? g : (g && g.coordinates);
        let finalLng = lng, finalLat = lat, finalHeading = heading;
        
        if (coords && coords.length > 1) {
          let minDist = Infinity;
          for (let i = 0; i < coords.length - 1; i++) {
            const a = coords[i], b = coords[i+1];
            const dx = b[0] - a[0], dy = b[1] - a[1];
            const len2 = dx*dx + dy*dy;
            let t = len2 > 0 ? ((lng - a[0])*dx + (lat - a[1])*dy) / len2 : 0;
            t = Math.max(0, Math.min(1, t));
            const projLng = a[0] + t * dx, projLat = a[1] + t * dy;
            const dist = (lng - projLng)**2 + (lat - projLat)**2;
            if (dist < minDist) {
              minDist = dist;
              finalLng = projLng;
              finalLat = projLat;
              const ddx = (b[0] - a[0]) * Math.cos(projLat * Math.PI/180);
              const ddy = b[1] - a[1];
              finalHeading = (Math.atan2(ddx, ddy) * 180 / Math.PI + 360) % 360;
            }
          }
        }
        
        markerRef.current.setLngLat([finalLng, finalLat])`;
if (app.includes(oldMarkerUpdate)) {
  app = app.replace(oldMarkerUpdate, newMarkerUpdate);
  console.log('MARKER_SNAP_APPLIED');
}

// 3. تحديث زاوية السهم
const oldRotation = "if (typeof finalHeading === 'number' && !isNaN(finalHeading)) setMarkerRotation(finalHeading)";
// الكود الجديد سيحتوي بالفعل على setMarkerRotation بعد التعديل
app = app.replace(
  "setMarkerRotation(heading)\n      }",
  "setMarkerRotation(finalHeading)\n      }"
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP_JSX_UPDATED');

// 4. إصلاح مايكروفون voiceControl (إغلاق بعد الأمر)
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إغلاق الميكروفون فوراً بعد تنفيذ الأمر
vc = vc.replace(
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch })",
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch }); clearTimers(); safeStop(); isListening = false; if (onStateChange) onStateChange(false);"
);

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('VOICE_CONTROL_UPDATED');