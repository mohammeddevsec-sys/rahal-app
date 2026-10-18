import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. إصلاح الخطأ النحوي الذي سببته أنا
c = c.replace('submitReport: async \\(type, gps\\) => \\{', 'submitReport: async (type, gps) => {');

// 2. إضافة منع التكرار في دالة الصوت (تعتمد على النوع والوقت فقط)
const voiceTarget = 'submitReport: async (type, gps) => {';
const voiceDedup = `
        const now = Date.now()
        if (lastReportRef.current.type === type && now - lastReportRef.current.time < 15000) {
          console.log('DUPLICATE_VOICE_BLOCKED:', type)
          return
        }
        lastReportRef.current = { type, time: now }
`;
if (c.includes(voiceTarget) && !c.includes('DUPLICATE_VOICE_BLOCKED')) {
  c = c.replace(voiceTarget, voiceTarget + voiceDedup);
}

// 3. إضافة منع التكرار في دالة الإضافة اليدوية
const manualTarget = 'const handleAddReport = useCallback(async (typeId, coords) => {';
const manualDedup = `
    const now = Date.now()
    if (lastReportRef.current.type === typeId && now - lastReportRef.current.time < 15000) {
      console.log('DUPLICATE_MANUAL_BLOCKED:', typeId)
      return
    }
    lastReportRef.current = { type: typeId, time: now }
`;
if (c.includes(manualTarget) && !c.includes('DUPLICATE_MANUAL_BLOCKED')) {
  c = c.replace(manualTarget, manualTarget + manualDedup);
}

fs.writeFileSync(f, c, 'utf8');
console.log('FIXED_AND_SAFE');