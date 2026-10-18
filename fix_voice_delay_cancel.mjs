import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// البحث عن بلوك إلغاء الرحلة وإضافة تأخير لنطق رنا (لأن stopTrip يقوم بإيقاف الصوت فوراً)
const oldBlock = `    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      say('\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062D\u0644\u0629');
    } else {`;

const newBlock = `    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      setTimeout(() => {
        say('\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062D\u0644\u0629');
      }, 600);
    } else {`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync(f, c, 'utf8');
  console.log('VOICE_DELAY_ADDED');
} else {
  console.log('PATTERN_NOT_FOUND_TRYING_ALT');
  // محاولة بديلة في حال تغيرت المسافات
  const altBlock = `ctx.onStopTrip();\n      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');`;
  if (c.includes(altBlock)) {
    c = c.replace(altBlock, `ctx.onStopTrip();\n      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 600);`);
    fs.writeFileSync(f, c, 'utf8');
    console.log('VOICE_DELAY_ADDED_ALT');
  }
}