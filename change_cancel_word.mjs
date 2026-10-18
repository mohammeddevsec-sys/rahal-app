import fs from 'fs';
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// البحث عن شرط إلغاء الرحلة القديم واستبداله بكلمة "وقف"
const cancelRegex = /if\s*\(\s*text\.includes\('\\u0644\\u063A'\)[^}]+\)\s*\{[\s\S]*?return;\s*\}/;

const newCancelBlock = `if (
    text.includes('\\u0648\\u0642\\u0641') || // وقف
    text.includes('\\u0627\\u0648\\u0642\\u0641') || // اوقف
    text.includes('\\u0623\\u0648\\u0642\\u0641') || // أوقف
    text.includes('\\u0648\\u0643\\u0641') || // وكف
    text.includes('\\u0627\\u0646\\u0647\\u064A') || // انهي
    text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') // الغاء (احتياطي)
  ) {
    console.log('CANCEL_TRIP_TRIGGERED:', text);
    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      setTimeout(() => {
        say('\\u062A\\u0645 \\u0625\\u064A\\u0642\\u0627\\u0641 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
      }, 1200);
    }
    return;
  }`;

if (cancelRegex.test(vc)) {
  vc = vc.replace(cancelRegex, newCancelBlock);
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('CANCEL_WORD_CHANGED_TO_STOP');
} else {
  console.log('PATTERN_NOT_FOUND');
}