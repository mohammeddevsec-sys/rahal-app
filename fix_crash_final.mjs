import fs from 'fs';

// 1. استعادة App.jsx من النسخة الذهبية
const src = 'D:/RAHAL/_backups/STABLE_v14_VOICE_FINAL_20261018_021149/src/App.jsx';
const dest = 'D:/RAHAL/src/App.jsx';
fs.copyFileSync(src, dest);
console.log('APP_RESTORED');

// 2. إصلاح voiceControl.js (تأخير استدعاء onStartTrip)
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة isMisheard نهائياً
vc = vc.replace(/const isMisheard = [^;]+;/g, '');
vc = vc.replace(/\|\|\s*isMisheard/g, '');
vc = vc.replace(/, '\\\| isMisheard:', isMisheard/g, '');

// تأخير استدعاء دالة بدء الرحلة لمدة 1.5 ثانية (ليترك مجالاً لصوت "أهلا بك" أن ينتهي)
vc = vc.replace(
  /if\s*\(typeof onStartTrip === 'function'\)\s*\{\s*onStartTrip\(\);\s*\}/,
  "if (typeof onStartTrip === 'function') { setTimeout(() => { onStartTrip(); }, 1500); }"
);

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('VOICE_DELAYED');