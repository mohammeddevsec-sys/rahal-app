import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// 1. إزالة شرط isRanaSpeaking الذي يمنع استلام صوتك (سنعتمد على فلتر رنا فقط)
c = c.replace("    if (isRanaSpeaking) { return }\r\n", "");
c = c.replace("    if (isRanaSpeaking) { return }\n", "");

// 2. توسيع كلمات الإلغاء لتشمل "الغى" و "الغ"
const oldCancel = `    text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || 
    text.includes('\\u0627\\u0644\\u063A\\u064A') ||   
    text.includes('\\u0627\\u0648\\u0642\\u0641') ||   
    text.includes('\\u0648\\u0642\\u0641') ||     
    text.includes('\\u0648\\u0643\\u0641') ||     
    text.includes('\\u0627\\u0646\\u0647\\u064A') ||   
    text.includes('\\u062E\\u0644\\u0627\\u0635')`;

const newCancel = `    text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || // الغاء
    text.includes('\\u0627\\u0644\\u063A\\u064A') ||   // الغي
    text.includes('\\u0627\\u0644\\u063A\\u0649') ||   // الغى
    text.includes('\\u0627\\u0644\\u063A') ||         // الغ
    text.includes('\\u0627\\u0648\\u0642\\u0641') ||   // اوقف
    text.includes('\\u0648\\u0642\\u0641') ||     // وقف
    text.includes('\\u0648\\u0643\\u0641') ||     // وكف
    text.includes('\\u0627\\u0646\\u0647\\u064A') ||   // انهي
    text.includes('\\u062E\\u0644\\u0627\\u0635') ||   // خلاص
    text.includes('\\u062E\\u0644\\u0635')       // خلص`;

if (c.includes(oldCancel)) {
  c = c.replace(oldCancel, newCancel);
  console.log('CANCEL_WORDS: EXPANDED');
} else {
  console.log('CANCEL_WORDS: NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');