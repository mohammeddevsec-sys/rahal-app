import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// ===== 1) isRanaSpeaking flag =====
if (!c.includes('let isRanaSpeaking')) {
  c = c.replace(
    "let pendingReport = null",
    "let pendingReport = null\nlet isRanaSpeaking = false\nlet dialogState = 'IDLE'"
  );
  changes++;
  console.log('FLAGS: ADDED');
}

// 2) say() يضبط isRanaSpeaking
const oldSay = `async function say(text) {
  try { await speakArabicViaServer(text) } catch { /* noop */ }
}`;

const newSay = `async function say(text) {
  isRanaSpeaking = true
  try { await speakArabicViaServer(text) } catch { /* noop */ }
  isRanaSpeaking = false
}`;

if (c.includes(oldSay)) {
  c = c.replace(oldSay, newSay);
  changes++;
  console.log('SAY: FLAG SET');
} else {
  console.log('SAY: PATTERN_NOT_FOUND');
}

// 3) في onresult: تجاهل إن كانت رنا تتكلم
const oldOnResult = `  recognition.onresult = function (event) {
    // خذ آخر نتيجة فقط (تحتوي النص الكامل التراكمي)`;

const newOnResult = `  recognition.onresult = function (event) {
    if (isRanaSpeaking) {
      console.log('RANA_SPEAKING_IGNORE')
      return
    }
    // خذ آخر نتيجة فقط (تحتوي النص الكامل التراكمي)`;

if (c.includes(oldOnResult)) {
  c = c.replace(oldOnResult, newOnResult);
  changes++;
  console.log('ONRESULT: RANA_GUARD');
} else {
  console.log('ONRESULT: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);