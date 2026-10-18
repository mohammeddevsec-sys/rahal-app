import fs from 'fs';

// 1. استعادة الملفات الأصلية من v14
const bk = 'D:/RAHAL/_backups/STABLE_v14_VOICE_FINAL_20261018_021149/src';
fs.copyFileSync(`${bk}/App.jsx`, 'D:/RAHAL/src/App.jsx');
fs.copyFileSync(`${bk}/lib/voiceControl.js`, 'D:/RAHAL/src/lib/voiceControl.js');
console.log('RESTORED_V14');

// 2. إزالة isMisheard فقط (لأنه يسبب إلغاء الرحلة عند قول "الرحله")
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// حذف تعريف isMisheard
vc = vc.replace(/const isMisheard = [^;]+;/g, '');
// حذف استخدامه في الشرط
vc = vc.replace(/\|\|\s*isMisheard/g, '');
// إزالة الطباعة
vc = vc.replace(/, '\\\| isMisheard:', isMisheard/g, '');
vc = vc.replace(/, 'isMisheard:', isMisheard/g, '');

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('REMOVED_ISMISHEARD');