import fs from 'fs';
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة أي أثر لمتغير isMisheard من الشروط والطباعة
vc = vc.replace(/\|\|\s*isMisheard/g, '');
vc = vc.replace(/, '\\u007C isMisheard:', isMisheard/g, '');
vc = vc.replace(/, 'isMisheard:', isMisheard/g, '');
vc = vc.replace(/,\s*isMisheard/g, '');

// إصلاح السطر المسبب للمشكلة
vc = vc.replace(
  /console\.log\('CANCEL_TRIP_TRIGGERED:', text, '\| isMisheard:', isMisheard\);/g,
  "console.log('CANCEL_TRIP_TRIGGERED:', text);"
);

// تنظيف أي أثر لكلمة isMisheard
vc = vc.replace(/if\s*\(cancelRegex\.test\(text\)\s*\|\|\s*\)/g, "if (cancelRegex.test(text))");

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');