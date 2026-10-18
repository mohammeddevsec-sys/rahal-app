import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// تنظيف أي بلوك إلغاء قديم
c = c.replace(/\/\/ ===== CANCEL TRIP =====[\s\S]*?return;\s*\}/g, '');

// إضافة بلوك إلغاء شامل جداً (يغطي كل احتمالات النطق)
const fnStart = "async function executeVoiceCommand(text, ctx) {";
if (c.includes(fnStart)) {
  const newBlock = `async function executeVoiceCommand(text, ctx) {
  // ===== CANCEL TRIP (Bulletproof) =====
  const cancelRegex = /\\u0644\\u063A|\\u0627\\u0644\\u063A|\\u0648\\u0642\\u0641|\\u0648\\u0643\\u0641|\\u0627\\u0646\\u0647\\u064A|\\u062E\\u0644\\u0627\\u0635|\\u062E\\u0644\\u0635|\\u0643\\u0646\\u0633\\u0644|\\u0643\\u0627\\u0646\\u0633\\u0644|\\u0627\\u0644\\u063A\\u0627\\u0621|\\u0627\\u0644\\u063A\\u064A|\\u0627\\u0644\\u063A\\u0649|\\u0627\\u0648\\u0642\\u0641|\\u0623\\u0648\\u0642\\u0641|\\u0623\\u0646\\u0647\\u064A|\\u0625\\u0644\\u063A\\u0627\\u0621|\\u0625\\u0644\\u063A\\u064A/;
  if (cancelRegex.test(text)) {
    console.log('CANCEL_TRIP_TRIGGERED:', text);
    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      setTimeout(() => {
        say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
      }, 800);
    }
    return;
  }
`;
  c = c.replace(fnStart, newBlock);
  fs.writeFileSync(f, c, 'utf8');
  console.log('DONE');
} else {
  console.log('NOT_FOUND');
}