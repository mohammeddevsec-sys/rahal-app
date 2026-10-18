import fs from 'fs';

// ===== 1. إصلاح App.jsx (منع النقاط المضاعفة) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إضافة فحص صارم للنوع والوقت فقط
const dedupLogic = `
    const now = Date.now()
    if (
      lastReportRef.current.type === type &&
      now - lastReportRef.current.time < 15000
    ) {
      console.log('DUPLICATE_REPORT_BLOCKED:', type)
      return
    }
    lastReportRef.current = { type, time: now }
`;

// حقنها في دالة الصوت
const voiceRegex = /submitReport: async \(type, gps\) => \{/;
if (voiceRegex.test(app) && !app.includes('DUPLICATE_REPORT_BLOCKED')) {
  app = app.replace(voiceRegex, voiceRegex.source + dedupLogic);
}

// حقنها في الدالة اليدوية (سواء كان اسمها typeId أو type)
const handleRegex = /const handleAddReport = useCallback\(async \([^,]+,[^)]+\) => \{/;
if (handleRegex.test(app) && !app.includes('DUPLICATE_REPORT_BLOCKED')) {
  app = app.replace(handleRegex, (match) => {
    const argName = match.match(/async \(([^,]+),/)[1];
    const localDedup = `
    const now = Date.now()
    if (
      lastReportRef.current.type === ${argName} &&
      now - lastReportRef.current.time < 15000
    ) {
      console.log('DUPLICATE_MANUAL_BLOCKED:', ${argName})
      return
    }
    lastReportRef.current = { type: ${argName}, time: now }
`;
    return match + localDedup;
  });
}
fs.writeFileSync(appPath, app, 'utf8');

// ===== 2. إصلاح voiceControl.js (إيقاف الصدى) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// عند إغلاق المايك، امسح النص المتراكم أوقف الإعادة
vc = vc.replace(
  "console.log('MIC_WINDOW_CLOSED')",
  "console.log('MIC_WINDOW_CLOSED')\n    accumText = '';"
);

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');