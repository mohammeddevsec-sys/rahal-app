import fs from 'fs';

// ===== 1. إزالة النطق من startTrip في App.jsx (لتجنب التعارض) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إزالة سطر speakArabic من داخل دالة startTrip
app = app.replace(
  /speakArabic\(UI_TEXT\.tripStarted \+ '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631'\)/g,
  '/* voice moved to voiceControl */'
);

// إزالة التعليق القديم /* silent start trip */
app = app.replace(/\/\* silent start trip \*\//g, '');

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP_JSX: VOICE_REMOVED_FROM_START');

// ===== 2. إضافة النطق في voiceControl.js بعد onStartTrip =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// البحث عن كتلة بدء الرحلة
const startTripRegex = /if\s*\(text\.includes\('\\u0627\\u0628\\u062F\\u0623'\)[\s\S]*?return\s*\}/;
if (startTripRegex.test(vc)) {
  vc = vc.replace(startTripRegex, (match) => {
    // إضافة say بعد onStartTrip
    return match.replace(
      'if (typeof onStartTrip === \'function\') onStartTrip()',
      `if (typeof onStartTrip === 'function') {
      onStartTrip()
      setTimeout(() => {
        say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')
      }, 300)
    }`
    );
  });
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE_CONTROL: VOICE_ADDED_TO_START');
} else {
  console.log('START_TRIP_NOT_FOUND');
}