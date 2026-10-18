import fs from 'fs';

// 1. إعادة النطق إلى App.jsx
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إزالة أي نطق قديم في startTrip
app = app.replace(/speakArabic\(UI_TEXT\.tripStarted[^)]*\)/g, '');

// إضافة النطق بعد setTripActive(true)
app = app.replace(
  "setTripActive(true)",
  "setTripActive(true)\n    speakArabic('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')"
);
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: Voice restored to startTrip');

// 2. تنظيف voiceControl.js من أي نطق لبدء الرحلة
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة أي say تتعلق ببدء الرحلة
vc = vc.replace(/setTimeout\(\(\) => \{\s*say\('\\u0628\\u062F\\u0623\\u062A [^']+'\);\s*\}, \d+\);?/g, '');
vc = vc.replace(/say\('\\u0628\\u062F\\u0623\\u062A [^']+'\)/g, '');

// التأكد من أن onStartTrip مجرد استدعاء نظيف
vc = vc.replace(/if\s*\(typeof onStartTrip === 'function'\)\s*\{[\s\S]*?\}/, "if (typeof onStartTrip === 'function') { onStartTrip() }");

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('VOICE: Removed start voice from voiceControl');