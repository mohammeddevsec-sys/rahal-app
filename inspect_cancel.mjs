import fs from 'fs';
const vc = fs.readFileSync('D:/RAHAL/src/lib/voiceControl.js', 'utf8');

// 1. هل بلوك الإلغاء موجود؟
const hasCancel = vc.includes('CANCEL_TRIP_TRIGGERED');
console.log('HAS_CANCEL_BLOCK:', hasCancel);

// 2. طباعة أول 25 سطر من دالة التنفيذ
const idx = vc.indexOf('async function executeVoiceCommand');
if (idx !== -1) {
  console.log('--- EXEC_FUNCTION_START ---');
  console.log(vc.substring(idx, idx + 1000));
  console.log('--- END ---');
}