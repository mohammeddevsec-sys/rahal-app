import fs from 'fs';

// 1. نسخة احتياطية
const destE = 'E:/RAHAL_GOLDEN_BEFORE_MIC_FIX_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
console.log('BACKUP_E_OK');

// 2. تعديل voiceControl.js
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// زيادة وقت السكوت ونافذة المايك
vc = vc.replace(/const SILENCE_MS = \d+/, 'const SILENCE_MS = 1500');
vc = vc.replace(/const MIC_WINDOW_MS = \d+/, 'const MIC_WINDOW_MS = 12000');

// إضافة كلمات لا يجب تجاهلها في فلتر رنا
const oldExplicit = "text.includes('\\u0627\\u0639\\u0645\\u0627\\u0644') || text.includes('\\u0645\\u0633\\u062F\\u0648\\u062F')";
const newExplicit = "text.includes('\\u0627\\u0639\\u0645\\u0627\\u0644') || text.includes('\\u0645\\u0633\\u062F\\u0648\\u062F') || text.includes('\\u0637\\u0631\\u064A\\u0642') || text.includes('\\u0645\\u0633\\u0627\\u0631')";

if (vc.includes(oldExplicit)) {
    vc = vc.replace(oldExplicit, newExplicit);
    console.log('EXPLICIT_WORDS_EXPANDED');
} else {
    // محاولة إضافتها في نهاية الشرط
    vc = vc.replace(
        /text\.includes\('\\u0645\\u0633\\u062F\\u0648\\u062F'\)/,
        "text.includes('\\u0645\\u0633\\u062F\\u0648\\u062F') || text.includes('\\u0637\\u0631\\u064A\\u0642') || text.includes('\\u0645\\u0633\\u0627\\u0631')"
    );
    console.log('EXPLICIT_WORDS_APPENDED');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');