import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. إزالة كل البلوكات المكررة التي تم حقنها سابقاً (بما فيها الفواصل المنقوطة)
c = c.replace(/const now = Date\.now\(\);?\s*if\s*\(\s*lastReportRef\.current\.type === type\s*&&\s*now - lastReportRef\.current\.time < 15000\s*\)\s*\{\s*console\.log\('DUPLICATE_VOICE_BLOCKED:', type\);?\s*return;?\s*\}\s*lastReportRef\.current = \{ type, time: now \};?/g, '');
c = c.replace(/const now = Date\.now\(\);?\s*if\s*\(\s*lastReportRef\.current\.type === typeId\s*&&\s*now - lastReportRef\.current\.time < 15000\s*\)\s*\{\s*console\.log\('DUPLICATE_MANUAL_BLOCKED:', typeId\);?\s*return;?\s*\}\s*lastReportRef\.current = \{ type: typeId, time: now \};?/g, '');

// 2. تنظيف أي بقايا من الإعلانات الزائدة لـ const now (إذا وجدت متتالية)
c = c.replace(/const now = Date\.now\(\);\s*const now = Date\.now\(\);/g, 'const now = Date.now();');

// 3. التأكد من وجود lastReportRef
if (!c.includes('lastReportRef')) {
  c = c.replace('const mapRef = useRef(null)', 'const mapRef = useRef(null)\n  const lastReportRef = useRef({ type: null, time: 0 })');
}

// 4. حقن البلوك في دالة الصوت (مرة واحدة)
const voiceTarget = 'submitReport: async (type, gps) => {';
if (c.includes(voiceTarget) && !c.includes('DUPLICATE_VOICE_BLOCKED')) {
  const cleanVoice = `
        const now = Date.now()
        if (lastReportRef.current.type === type && now - lastReportRef.current.time < 15000) {
          console.log('DUPLICATE_VOICE_BLOCKED:', type)
          return
        }
        lastReportRef.current = { type, time: now }
`;
  c = c.replace(voiceTarget, voiceTarget + cleanVoice);
}

// 5. حقن البلوك في دالة الإضافة اليدوية (مرة واحدة)
const manualTarget = 'const handleAddReport = useCallback(async (typeId, coords) => {';
if (c.includes(manualTarget) && !c.includes('DUPLICATE_MANUAL_BLOCKED')) {
  const cleanManual = `
    const now = Date.now()
    if (lastReportRef.current.type === typeId && now - lastReportRef.current.time < 15000) {
      console.log('DUPLICATE_MANUAL_BLOCKED:', typeId)
      return
    }
    lastReportRef.current = { type: typeId, time: now }
`;
  c = c.replace(manualTarget, manualTarget + cleanManual);
}

fs.writeFileSync(f, c, 'utf8');
console.log('CLEANED_AND_FIXED');