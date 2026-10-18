import fs from 'fs';
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 1. حذف البلوك الأول المعقد (Smart Cancel)
const smartCancelRegex = /\/\/ ===== CANCEL TRIP \(Smart\) =====[\s\S]*?return;\s*\}/;
if (smartCancelRegex.test(vc)) {
  vc = vc.replace(smartCancelRegex, '');
  console.log('REMOVED_FIRST_BLOCK');
}

// 2. حذف البلوك الثاني المكرر
const secondCancelRegex = /if\s*\(\s*text\.includes\('\\u0627\\u0648\\u0642\\u0641'\)[\s\S]*?return\s*\}/;
if (secondCancelRegex.test(vc)) {
  vc = vc.replace(secondCancelRegex, '');
  console.log('REMOVED_SECOND_BLOCK');
}

// 3. إضافة البلوك الجديد النظيف (يعتمد على كلمة وقف فقط)
const newBlock = `
  // ===== CANCEL TRIP (Stop Only) =====
  if (
    text.includes('\\u0648\\u0642\\u0641') || // وقف
    text.includes('\\u0627\\u0648\\u0642\\u0641') || // اوقف
    text.includes('\\u0623\\u0648\\u0642\\u0641') || // أوقف
    text.includes('\\u0648\\u0643\\u0641') // وكف
  ) {
    console.log('STOP_TRIP_TRIGGERED:', text);
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u064A\\u0642\\u0627\\u0641 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 1200);
    }
    return;
  }
`;

// حقن البلوك الجديد في بداية دالة executeVoiceCommand
const target = "console.log('DEBUG_EXEC:', JSON.stringify(text), '| tripActive:', tripActive);";
if (vc.includes(target)) {
  vc = vc.replace(target, target + '\n' + newBlock);
  console.log('ADDED_NEW_CANCEL_BLOCK');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');