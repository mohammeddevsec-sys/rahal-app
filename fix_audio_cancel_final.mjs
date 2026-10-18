import fs from 'fs';

// ===== 1. إصلاح App.jsx (نطق بدء الرحلة) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
if (!app.includes('speakArabic(UI_TEXT.tripStarted')) {
  app = app.replace(
    "setTripActive(true)",
    "setTripActive(true)\n    speakArabic(UI_TEXT.tripStarted + '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')"
  );
}
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: START VOICE FORCED');

// ===== 2. إصلاح voiceControl.js (إلغاء الرحلة + النطق المتأخر) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة كود isMisheard المسبب للإرباك
vc = vc.replace(/const isMisheard = [^;]+;/, '');
vc = vc.replace(/if \(cancelRegex\.test\(text\) \|\| isMisheard\)/, "if (cancelRegex.test(text))");

// إضافة تأخير لنطق "تم الإلغاء" (ثانية كاملة) حتى لا يقطعه stopSpeaking
vc = vc.replace(
  "if (typeof onStopTrip === 'function') {\n      onStopTrip()\n      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 600);",
  "if (typeof onStopTrip === 'function') {\n      onStopTrip()\n      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 1200);"
);
// احتياطي في حال اختلف النص
vc = vc.replace(
  /setTimeout\(\(\) => \{ say\('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'\); \}, 600\);/g,
  "setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 1200);"
);

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('VOICE: CANCEL FIXED (1200ms delay)');