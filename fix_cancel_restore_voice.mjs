import fs from 'fs';

// ===== 1. App.jsx: استرجاع نطق بدء الرحلة (بدأت الرحلة، قد بحذر) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// البحث عن دالة startTrip واسترجاع النطق
const startTripRegex = /const startTrip = useCallback\(\(\) => \{([\s\S]*?)\}, \[routeInfo, location, applyRoute\]\)/;
if (startTripRegex.test(app)) {
  app = app.replace(startTripRegex, (match, body) => {
    // إزالة أي "silent" قديم
    let cleanBody = body.replace(/\/\* silent \*\//g, '');
    // إضافة النطق إذا لم يكن موجوداً
    if (!cleanBody.includes('speakArabic')) {
      // نضيف النطق بعد أول سطر
      cleanBody = cleanBody.replace(
        /(setTripActive\(true\))/,
        `$1\n    speakArabic(UI_TEXT.tripStarted + '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')`
      );
    }
    return `const startTrip = useCallback(() => {${cleanBody}}, [routeInfo, location, applyRoute])`;
  });
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: START_TRIP_VOICE_RESTORED');
}

// ===== 2. voiceControl.js: إصلاح الإلغاء (فحص أول + خيارات متعددة) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة أي بلوك إلغاء قديم
vc = vc.replace(/\/\/ ===== CANCEL TRIP[\s\S]*?\n\s*\}\n/g, '');
vc = vc.replace(/\/\/ === FORCED CANCEL CHECK ===[\s\S]*?return;\s*\}/g, '');

// إضافة بلوك إلغاء في بداية الدالة (قبل أي منطق آخر)
const execStart = "async function executeVoiceCommand(text, ctx) {";
const cancelBlock = `async function executeVoiceCommand(text, ctx) {
  // ===== CANCEL TRIP (Must be first) =====
  const cancelWords = [
    '\\u0627\\u0644\\u063A\\u0627\\u0621',    // الغاء
    '\\u0625\\u0644\\u063A\\u0627\\u0621',    // إلغاء
    '\\u0627\\u0644\\u063A\\u064A',        // الغي
    '\\u0625\\u0644\\u063A\\u064A',        // إلغي
    '\\u0627\\u0648\\u0642\\u0641',        // اوقف
    '\\u0623\\u0648\\u0642\\u0641',        // أوقف
    '\\u0648\\u0642\\u0641',              // وقف
    '\\u0648\\u0643\\u0641',              // وكف
    '\\u0627\\u0646\\u0647\\u064A',        // انهي
    '\\u0623\\u0646\\u0647\\u064A',        // أنهي
    '\\u0627\\u0646\\u0647\\u0627\\u0621', // انهاء
    '\\u062E\\u0644\\u0627\\u0635',        // خلاص
    '\\u062E\\u0644\\u0635'               // خلص
  ];
  let isCancel = false;
  for (const w of cancelWords) {
    if (text.includes(w)) { isCancel = true; break; }
  }
  if (isCancel) {
    console.log('CANCEL_TRIP_TRIGGERED');
    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
    }
    return;
  }
`;

if (vc.includes(execStart) && !vc.includes('CANCEL_TRIP_TRIGGERED')) {
  vc = vc.replace(execStart, cancelBlock);
  console.log('VOICE_CONTROL: CANCEL_BLOCK_ADDED');
}

// ضبط التوقيتات (5 ثوانٍ للاستماع، 600ms للسكوت = سريع الاستجابة)
vc = vc.replace(/const MIC_WINDOW_MS = \d+/, 'const MIC_WINDOW_MS = 5000');
vc = vc.replace(/const SILENCE_MS = \d+/, 'const SILENCE_MS = 600');
console.log('VOICE_CONTROL: TIMING 5s/600ms');

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');