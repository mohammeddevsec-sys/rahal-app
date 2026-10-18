import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// 1. تنظيف أي بلوكات إلغاء سابقة لتجنب التداخل
c = c.replace(/\/\/ ===== STOP TRIP =====[\s\S]*?\/\/ ===== START TRIP =====/g, '// ===== START TRIP =====');
c = c.replace(/\/\/ === FORCED CANCEL CHECK ===[\s\S]*?return;\s*\}/g, '');

// 2. حقن أمر الإلغاء الصريح قبل بدء الرحلة مباشرة
const startMarker = '// ===== START TRIP =====';
if (c.includes(startMarker)) {
  const strictCancel = `// ===== CANCEL TRIP =====
  if (text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || text.includes('\\u0627\\u0644\\u063A\\u064A') || text.includes('\\u0648\\u0642\\u0641') || text.includes('\\u0627\\u0648\\u0642\\u0641') || text.includes('\\u0627\\u0646\\u0647\\u064A') || text.includes('\\u062E\\u0644\\u0627\\u0635') || text.includes('\\u0648\\u0643\\u0641')) {
    console.log('STOP_TRIP_TRIGGERED:', text);
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
    }
    return;
  }

  `;
  c = c.replace(startMarker, strictCancel + startMarker);
}

// 3. إزالة كلمة "الرحلة" من أمر بدء الرحلة لمنع التداخل
c = c.replace(/text\.includes\('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'\) \|\| /g, '');
c = c.replace(/text\.includes\('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647'\) \|\| /g, '');
c = c.replace(/ \|\| text\.includes\('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'\)/g, '');
c = c.replace(/ \|\| text\.includes\('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647'\)/g, '');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');