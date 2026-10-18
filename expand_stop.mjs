import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// البحث عن شرط إلغاء الرحلة الحالي واستبداله بشرط أوسع
const stopRegex = /if \(text\.includes\('\\u0627\\u0644\\u063A\\u0627\\u0621'\) \|\| text\.includes\('\\u0627\\u0644\\u063A\\u064A'\) \|\| text\.includes\('\\u0627\\u0648\\u0642\\u0641'\) \|\| text\.includes\('\\u0648\\u0642\\u0641'\) \|\| text\.includes\('\\u0627\\u0646\\u0647\\u064A'\) \|\| text\.includes\('\\u062E\\u0644\\u0635'\)\) \{/;

const newStopLogic = `if (
      text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || // الغاء
      text.includes('\\u0627\\u0644\\u063A\\u064A') ||   // الغي
      text.includes('\\u0627\\u0648\\u0642\\u0641') ||   // اوقف
      text.includes('\\u0648\\u0642\\u0641') ||     // وقف
      text.includes('\\u0627\\u0646\\u0647\\u064A') ||   // انهي
      text.includes('\\u062E\\u0644\\u0635') ||     // خلص
      text.includes('\\u062E\\u0644\\u0627\\u0635') ||   // خلاص
      text.includes('\\u0643\\u0641\\u064A') ||     // كفي
      text.includes('\\u0628\\u0633')             // بس
    ) {`;

if (stopRegex.test(c)) {
  c = c.replace(stopRegex, newStopLogic);
  fs.writeFileSync(f, c, 'utf8');
  console.log('STOP_LOGIC: EXPANDED');
} else {
  // محاولة البحث بصيغة أخرى إذا تغيرت المسافات
  const idx = c.indexOf('// ===== STOP TRIP =====');
  if (idx !== -1) {
    const endIdx = c.indexOf('{', idx);
    c = c.substring(0, endIdx) + "{\n    if (text.includes('\\u062E\\u0644\\u0627\\u0635') || text.includes('\\u0628\\u0633') || text.includes('\\u0643\\u0641\\u064A') || text.includes('\\u062E\\u0644\\u0635') || text.includes('\\u0627\\u0648\\u0642\\u0641') || text.includes('\\u0648\\u0642\\u0641') || text.includes('\\u0627\\u0646\\u0647\\u064A') || text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || text.includes('\\u0627\\u0644\\u063A\\u064A')) {" + c.substring(endIdx + 1);
    fs.writeFileSync(f, c, 'utf8');
    console.log('STOP_LOGIC: FORCED');
  } else {
    console.log('STOP_TRIP_BLOCK_NOT_FOUND');
  }
}