import fs from 'fs';

// ===== 1. أخذ نسخة احتياطية على E =====
const destE = 'E:/RAHAL_GOLDEN_BEFORE_SPEED_FIX_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
fs.cpSync('D:/RAHAL/server', destE + '/server', { recursive: true });
fs.cpSync('D:/RAHAL/public', destE + '/public', { recursive: true });
console.log('BACKUP_E_OK: ' + destE);

// ===== 2. تعديل App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// أ) إضافة حالة السرعة والمتغير المرجعي
if (!app.includes('const [speedKmh, setSpeedKmh] = useState(0)')) {
  app = app.replace(
    'const [isMicListening, setIsMicListening] = useState(false)',
    'const [isMicListening, setIsMicListening] = useState(false)\n  const [speedKmh, setSpeedKmh] = useState(0)\n  const simSpeedRef = useRef(0)'
  );
}

// ب) حقن حساب المسافة داخل حلقة RAF (لحساب سرعة المحاكاة)
const rafTarget = "sm.lng += (tgt.lng - sm.lng) * k\n          sm.lat += (tgt.lat - sm.lat) * k";
const rafReplacement = `const oldLng = sm.lng
          const oldLat = sm.lat
          sm.lng += (tgt.lng - sm.lng) * k
          sm.lat += (tgt.lat - sm.lat) * k
          if (typeof metersBetween === 'function') {
            const dist = metersBetween({lat: oldLat, lng: oldLng}, {lat: sm.lat, lng: sm.lng})
            simSpeedRef.current = dist * 60
          }`;

if (app.includes(rafTarget)) {
  app = app.replace(rafTarget, rafReplacement);
}

// ج) إضافة مؤقت لتحديث حالة السرعة كل نصف ثانية
if (!app.includes('setSpeedKmh(Math.round(simSpeedRef.current * 3.6))')) {
  const effectAnchor = 'useEffect(() => {\n    if (!mapReady) return\n    let rafId';
  const newEffect = `useEffect(() => {
      const timer = setInterval(() => {
        setSpeedKmh(Math.round(simSpeedRef.current * 3.6))
      }, 500)
      return () => clearInterval(timer)
    }, [])

    useEffect(() => {
    if (!mapReady) return
    let rafId`;
  app = app.replace(effectAnchor, newEffect);
}

// د) تحديث واجهة السرعة لتستخدم السرعة الحقيقية أو سرعة المحاكاة
app = app.replace(
  '{Math.round((location && location.speed ? location.speed : 0) * 3.6)}',
  '{location && location.speed && location.speed > 1 ? Math.round(location.speed * 3.6) : speedKmh}'
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP_JSX_UPDATED_WITH_SPEED');