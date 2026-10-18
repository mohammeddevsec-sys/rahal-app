import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

const target = "const map = getMap ? getMap() : null";

const forcedCheck = `
  // === FORCED CANCEL CHECK ===
  if (
    text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || // الغاء
    text.includes('\\u0627\\u0644\\u063A\\u064A') ||   // الغي
    text.includes('\\u0627\\u0644\\u063A') ||         // الغ
    text.includes('\\u0627\\u0646\\u0647\\u064A') ||   // انهي
    text.includes('\\u0627\\u0646\\u0647\\u0627\\u0621') || // انهاء
    text.includes('\\u0648\\u0643\\u0641') ||     // وكف
    text.includes('\\u0648\\u0642\\u0641') ||     // وقف
    text.includes('\\u0627\\u0648\\u0642\\u0641') ||   // اوقف
    text.includes('\\u062E\\u0644\\u0627\\u0635')      // خلاص
  ) {
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
    }
    return;
  }
`;

if (c.includes(target) && !c.includes('FORCED CANCEL CHECK')) {
  c = c.replace(target, target + forcedCheck);
  fs.writeFileSync(f, c, 'utf8');
  console.log('DONE');
} else {
  console.log('ALREADY_EXISTS_OR_NOT_FOUND');
}