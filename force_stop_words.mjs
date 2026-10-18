import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// البحث عن كتلة إلغاء الرحلة الحالية واستبدالها
const startMarker = '// ===== STOP TRIP =====';
const startIdx = c.indexOf(startMarker);
if (startIdx === -1) { console.log('NOT_FOUND'); process.exit(1); }

const ifIdx = c.indexOf('if (', startIdx);
const condEnd = c.indexOf(') {', ifIdx);

const newCond = `if (
      text.includes('\\u0648\\u0643\\u0641') || // وكف
      text.includes('\\u0627\\u0646\\u0647\\u064A') || // انهي
      text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || // الغاء
      text.includes('\\u0627\\u0644\\u063A\\u064A') || // الغي
      text.includes('\\u0627\\u0648\\u0642\\u0641') || // اوقف
      text.includes('\\u0648\\u0642\\u0641') || // وقف
      text.includes('\\u062E\\u0644\\u0635') || // خلص
      text.includes('\\u062E\\u0644\\u0627\\u0635') // خلاص
    ) {`;

c = c.substring(0, ifIdx) + newCond + c.substring(condEnd + 3);
fs.writeFileSync(f, c, 'utf8');
console.log('DONE');