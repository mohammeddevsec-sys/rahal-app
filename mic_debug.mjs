import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// 1. تقييد وقت حظر صوت رنا (حتى لا يعلق المايك إذا تأخر الخادم)
c = c.replace(
  "const est = Math.max(1500, (text || '').length * 130);\n  setTimeout(() => { isRanaSpeaking = false }, est)",
  "setTimeout(() => { isRanaSpeaking = false }, 2500)" // حد أقصى 2.5 ثانية
);

// 2. إضافة طباعة النص الخام الذي يسمعه المتصفح
if (!c.includes('RAW_MIC_INPUT')) {
  c = c.replace(
    "recognition.onresult = function (event) {",
    "recognition.onresult = function (event) {\n    console.log('RAW_MIC_INPUT:', event.results[event.results.length - 1][0].transcript);"
  );
}

// 3. إضافة طباعة حالة الحظر
if (!c.includes('RANA_STATUS')) {
  c = c.replace(
    "if (isRanaSpeaking) { return }",
    "if (isRanaSpeaking) { console.log('RANA_STATUS: BLOCKED'); return }\n    console.log('RANA_STATUS: CLEAR');"
  );
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');