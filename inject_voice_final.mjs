import fs from 'fs';

// 1. تنظيف App.jsx تماماً من أي أوامر صوتية متداخلة
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
// إزالة أي speakArabic من داخل دالة startTrip
app = app.replace(/speakArabic\(UI_TEXT\.tripStarted[^)]*\)/g, '/* voice handled in voiceControl */');
// إزالة أي stopSpeaking من داخل دالة startTrip
app = app.replace(/stopSpeaking\(\)/g, '/* removed */');
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: Cleaned');

// 2. حقن النطق في voiceControl.js بطريقة مباشرة
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة isMisheard إذا كان موجوداً
vc = vc.replace(/const isMisheard = [^;]+;/g, '');
vc = vc.replace(/\|\|\s*isMisheard/g, '');

// البحث عن onStartTrip وحقن النطق بعده مباشرة
const searchStr = "if (typeof onStartTrip === 'function') {\n      onStartTrip()\n    }";
const replaceStr = `if (typeof onStartTrip === 'function') {
      onStartTrip()
      setTimeout(() => {
        say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')
      }, 300)
    }`;

if (vc.includes(searchStr)) {
  vc = vc.replace(searchStr, replaceStr);
  console.log('VOICE: Start trip voice injected (exact match)');
} else {
  // إذا لم يتطابق، نبحث عن النمط بشكل مرن
  const regex = /if\s*\(typeof onStartTrip === 'function'\)\s*\{\s*onStartTrip\(\)\s*\}/;
  if (regex.test(vc)) {
    vc = vc.replace(regex, `if (typeof onStartTrip === 'function') { onStartTrip(); setTimeout(() => { say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631'); }, 300); }`);
    console.log('VOICE: Start trip voice injected (regex)');
  } else {
    console.log('VOICE: Pattern NOT FOUND');
  }
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');