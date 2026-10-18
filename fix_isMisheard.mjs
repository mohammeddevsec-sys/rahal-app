import fs from 'fs';
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 1. إزالة أي استخدام لمتغير isMisheard
vc = vc.replace(/\s*\|\|\s*isMisheard/g, ''); 
vc = vc.replace(/const isMisheard = [^;]+;/g, '');

// 2. إعادة كتابة بلوك الإلغاء بالكامل ليكون نظيفاً
const cancelBlockRegex = /if\s*\(cancelRegex\.test\(text\)\)\s*\{[\s\S]*?return;\s*\}/;
if (cancelBlockRegex.test(vc)) {
  const newCancelBlock = `if (cancelRegex.test(text)) {
    console.log('CANCEL_TRIP_TRIGGERED:', text);
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 1200);
    }
    return;
  }`;
  vc = vc.replace(cancelBlockRegex, newCancelBlock);
  console.log('CANCEL_BLOCK_FIXED');
} else {
  console.log('CANCEL_BLOCK_NOT_FOUND');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');