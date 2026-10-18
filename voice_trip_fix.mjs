import fs from 'fs';

// ===== 1) voiceControl.js: توسيع كلمات الرحلة =====
const vf = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vf, 'utf8');

const oldTrip = `  if (text.includes('\\u0627\\u0628\\u062F\\u0623') || text.includes('\\u0627\\u0628\\u062F\\u0627') ||
      text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u064A\\u0644\\u0627 \\u0631\\u0648\\u062D') ||
      text.includes('\\u0645\\u0634\\u064A\\u0646\\u0627')) {`;

const newTrip = `  if (text.includes('\\u0627\\u0628\\u062F\\u0623') || text.includes('\\u0627\\u0628\\u062F\\u0627') || text.includes('\\u0627\\u0628\\u062F\\u064A') ||
      text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647') || text.includes('\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0631\\u062D\\u0644\\u0647') ||
      text.includes('\\u064A\\u0644\\u0627 \\u0631\\u0648\\u062D') || text.includes('\\u0645\\u0634\\u064A\\u0646\\u0627') ||
      text.includes('\\u0633\\u0627\\u0641\\u0631') || text.includes('\\u0627\\u0646\\u0637\\u0644\\u0642') || text.includes('\\u0645\\u0646\\u0637\\u0644\\u0642') ||
      text.includes('\\u064A\\u0644\\u0627')) {`;

if (v.includes(oldTrip)) {
  v = v.replace(oldTrip, newTrip);
  fs.writeFileSync(vf, v, 'utf8');
  console.log('VOICE: TRIP KEYWORDS EXPANDED');
} else {
  console.log('VOICE: PATTERN_NOT_FOUND - showing current:');
  const idx = v.indexOf('// ===== START TRIP =====');
  console.log(JSON.stringify(v.substring(idx, idx + 300)));
}

// ===== 2) App.jsx: تأكد من تمرير startTrip =====
const af = 'D:/RAHAL/src/App.jsx';
let a = fs.readFileSync(af, 'utf8');

// ابحث عن نداء toggleVoiceControl
const idx = a.indexOf('toggleVoiceControl({');
if (idx === -1) {
  console.log('APP: toggleVoiceControl NOT_FOUND');
} else {
  const snippet = a.substring(idx, idx + 500);
  console.log('APP: CALL SNIPPET:');
  console.log(snippet);
}