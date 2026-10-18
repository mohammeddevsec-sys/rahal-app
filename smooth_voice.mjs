import fs from 'fs';

// 1. نسخة احتياطية
const destE = 'E:/RAHAL_GOLDEN_BEFORE_SMOOTH_VOICE_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
console.log('BACKUP_E_OK');

const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 2. زيادة وقت السكوت إلى 2.5 ثانية ونافذة المايك إلى 20 ثانية
vc = vc.replace(/const SILENCE_MS = \d+/, 'const SILENCE_MS = 2500');
vc = vc.replace(/const MIC_WINDOW_MS = \d+/, 'const MIC_WINDOW_MS = 20000');
console.log('TIMING_UPDATED');

// 3. تحسين خوارزمية التقاط الكلمات
const oldLogic = `  let type = null
  let msg = ''
  if (text.includes('سيطر') || text.includes('تفتيش')) { type = 'checkpoint'; msg = 'تم تسجيل نقطة تفتيش' }
  else if (text.includes('حادث') || text.includes('دعمية')) { type = 'accident'; msg = 'تم الإبلاغ عن حادث' }
  else if (text.includes('مطب') || text.includes('طسة')) { type = 'speed_bump'; msg = 'تمت إضافة مطب' }
  else if (text.includes('ازدحام')) { type = 'traffic'; msg = 'تم تسجيل ازدحام' }
  else if (text.includes('كامير') || text.includes('رادار')) { type = 'camera'; msg = 'تنبيه، رادار' }
  else if (text.includes('طوار') || text.includes('عاطل')) { type = 'emergency'; msg = 'طوارئ' }
  else if (text.includes('حيوان') || text.includes('بقر')) { type = 'animals'; msg = 'حيوانات على الطريق' }
  else if (text.includes('طقس') || text.includes('مطر')) { type = 'bad_weather'; msg = 'طقس سيئ' }
  else if (text.includes('اعمال')) { type = 'road_work'; msg = 'أعمال على الطريق' }
  else if (text.includes('مسدود') || text.includes('مغلق') || text.includes('خطر')) { type = 'hazard'; msg = 'عائق في الطريق' }
  else if (text.includes('وقود') || text.includes('بنزين')) { type = 'fuel'; msg = 'محطة وقود' }`;

const newLogic = `  let type = null
  let msg = ''
  if (text.includes('سيطر') || text.includes('تفتيش')) { type = 'checkpoint'; msg = 'تم تسجيل نقطة تفتيش' }
  else if (text.includes('حادث') || text.includes('دعمية') || text.includes('صادم')) { type = 'accident'; msg = 'تم الإبلاغ عن حادث' }
  else if (text.includes('مطب') || text.includes('طسة') || text.includes('طسه')) { type = 'speed_bump'; msg = 'تمت إضافة مطب' }
  else if (text.includes('ازدحام') || text.includes('زحمة') || text.includes('ازد') || text.includes('حام')) {
    if (text.includes('كثيف') || text.includes('شديد') || text.includes('قوي') || text.includes('واكف')) {
      type = 'traffic_heavy'; msg = 'تم تسجيل ازدحام شديد'
    } else {
      type = 'traffic'; msg = 'تم تسجيل ازدحام'
    }
  }
  else if (text.includes('كامير') || text.includes('رادار') || text.includes('مراقب') || text.includes('كامره')) { type = 'camera'; msg = 'تنبيه، رادار' }
  else if (text.includes('طوار') || text.includes('عاطل') || text.includes('اسعاف') || text.includes('نجدة')) { type = 'emergency'; msg = 'طوارئ' }
  else if (text.includes('حيوان') || text.includes('بقر') || text.includes('غنم') || text.includes('حيوانات')) { type = 'animals'; msg = 'حيوانات على الطريق' }
  else if (text.includes('طقس') || text.includes('مطر') || text.includes('امطار') || text.includes('سيء') || text.includes('سيئ') || text.includes('غبار')) { type = 'bad_weather'; msg = 'طقس سيئ' }
  else if (text.includes('اعمال') || text.includes('صيانة') || text.includes('ترميم')) { type = 'road_work'; msg = 'أعمال على الطريق' }
  else if (text.includes('مسدود') || text.includes('مغلق') || text.includes('خطر') || text.includes('عائق')) { type = 'hazard'; msg = 'عائق في الطريق' }
  else if (text.includes('وقود') || text.includes('بنزين') || text.includes('كاز') || text.includes('محطة')) { type = 'fuel'; msg = 'محطة وقود' }`;

if (vc.includes(oldLogic)) {
  vc = vc.replace(oldLogic, newLogic);
  console.log('SMART_MATCHING_APPLIED');
} else {
  // Fallback to regex replace for the block
  vc = vc.replace(/let type = null[\s\S]*?else if \(text\.includes\('وقود'\)[^\}]*\}/, newLogic);
  console.log('SMART_MATCHING_APPLIED_VIA_REGEX');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');