import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// 1. تنظيف أي بلوكات إلغاء قديمة ومكسورة لضمان عدم تكرار الأكواد
c = c.replace(/\/\/ ===== CANCEL TRIP[\s\S]*?return;\s*\}/g, '');
c = c.replace(/\/\/ === FORCED CANCEL CHECK ===[\s\S]*?return;\s*\}/g, '');

// 2. حقن بلوك الإلغاء الجديد والنهائي (مع كلمة كنسل) في بداية الدالة
const fnStart = "async function executeVoiceCommand(text, ctx) {";
if (c.includes(fnStart)) {
  const newBlock = `async function executeVoiceCommand(text, ctx) {
  // ===== CANCEL TRIP =====
  if (
    text.includes('\\u0644\\u063A') || // لغ (الغاء، الغي، الغى)
    text.includes('\\u0648\\u0642\\u0641') || // وقف
    text.includes('\\u0648\\u0643\\u0641') || // وكف
    text.includes('\\u0627\\u0646\\u0647\\u064A') || // انهي
    text.includes('\\u062E\\u0644\\u0627\\u0635') || // خلاص
    text.includes('\\u062E\\u0644\\u0635') || // خلص
    text.includes('\\u0643\\u0646\\u0633\\u0644') || // كنسل
    text.includes('\\u0643\\u0627\\u0646\\u0633\\u0644') // كانسل
  ) {
    console.log('CANCEL_TRIP_TRIGGERED:', text);
    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
    } else {
      console.log('ERROR: onStopTrip is missing!');
    }
    return;
  }
`;
  c = c.replace(fnStart, newBlock);
  fs.writeFileSync(f, c, 'utf8');
  console.log('DONE');
} else {
  console.log('FUNCTION_NOT_FOUND');
}