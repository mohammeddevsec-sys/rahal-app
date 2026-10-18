import fs from 'fs';
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 1. إضافة متغير للتحكم في إيقاف المايك
if (!vc.includes('let isPausedForTTS = false')) {
  vc = vc.replace('let isRanaSpeaking = false', 'let isRanaSpeaking = false\nlet isPausedForTTS = false');
}

// 2. تعديل دالة النطق لتغلق المايك وتعيد فتحه
const sayRegex = /async function say\(text\) \{[\s\S]*?\n\}/;
const newSay = `async function say(text) {
  isRanaSpeaking = true
  isPausedForTTS = true
  if (recognition) { try { recognition.abort() } catch { /* noop */ } }
  
  try { await speakArabicViaServer(text) } catch { /* noop */ }
  
  const delay = Math.max(2000, text.length * 150)
  setTimeout(() => {
    isRanaSpeaking = false
    isPausedForTTS = false
    if (isListening) { try { recognition.start() } catch { /* noop */ } }
  }, delay)
}`;
vc = vc.replace(sayRegex, newSay);

// 3. منع إعادة التشغيل التلقائي أثناء نطق رنا
vc = vc.replace(
  "recognition.onend = function () {",
  "recognition.onend = function () {\n    if (isPausedForTTS) return;"
);
vc = vc.replace(
  "recognition.onerror = function (event) {",
  "recognition.onerror = function (event) {\n    if (isPausedForTTS) return;"
);

// 4. إزالة مؤقت بدء المايك اليدوي (لأن الدالة say() تتولى الأمر الآن)
const startTimeoutRegex = /setTimeout\(\(\)\s*=>\s*\{[\s\S]*?recognition\.start\(\)[\s\S]*?\},\s*1800\)/;
if (startTimeoutRegex.test(vc)) {
  vc = vc.replace(startTimeoutRegex, '/* mic start handled in say() */');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');