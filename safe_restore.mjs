import fs from 'fs';

// 1. استعادة الملف من النسخة الاحتياطية
const bkPath = 'D:/RAHAL/_backups/STABLE_v12_GAMIFICATION_20261018_003626/src/lib/voiceControl.js';
const currentPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(bkPath, 'utf8');

// 2. ضبط التوقيتات
vc = vc.replace(/const MIC_WINDOW_MS = \d+/, 'const MIC_WINDOW_MS = 5000');
vc = vc.replace(/const SILENCE_MS = \d+/, 'const SILENCE_MS = 600');

// 3. إضافة فحص "الغاء الرحلة" في أعلى دالة التنفيذ
const functionStart = "async function executeVoiceCommand(text, ctx) {";
const cancelLogic = `async function executeVoiceCommand(text, ctx) {
  // ===== CANCEL TRIP CHECK =====
  if (
    text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || 
    text.includes('\\u0627\\u0644\\u063A\\u064A') ||   
    text.includes('\\u0627\\u0648\\u0642\\u0641') ||   
    text.includes('\\u0648\\u0642\\u0641') ||     
    text.includes('\\u0648\\u0643\\u0641') ||     
    text.includes('\\u0627\\u0646\\u0647\\u064A') ||   
    text.includes('\\u062E\\u0644\\u0627\\u0635')
  ) {
    console.log('CANCEL_TRIP_TRIGGERED');
    if (ctx && typeof ctx.onStopTrip === 'function') {
      ctx.onStopTrip();
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
    }
    return;
  }
`;
vc = vc.replace(functionStart, cancelLogic);

// 4. حفظ الملف
fs.writeFileSync(currentPath, vc, 'utf8');
console.log('RESTORED_AND_PATCHED');