import fs from 'fs';

// 1. إزالة الصوت من دالة startTrip في App.jsx (لمنع أي تداخل)
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/speakArabic\(UI_TEXT\.tripStarted[^)]*\)/g, '/* voice handled by voiceControl */');
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: Voice removed from startTrip');

// 2. إضافة الصوت في voiceControl.js (عند تنفيذ الأمر الصوتي)
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

const startRegex = /if\s*\(typeof onStartTrip === 'function'\)\s*\{\s*setTimeout\(\(\)\s*=>\s*\{\s*onStartTrip\(\);\s*\},\s*1500\);\s*\}/;
const newStart = `if (typeof onStartTrip === 'function') {
      setTimeout(() => { 
        onStartTrip(); 
        say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631'); 
      }, 1500);
    }`;

if (startRegex.test(vc)) {
  vc = vc.replace(startRegex, newStart);
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE: Start voice added to voiceControl');
} else {
  console.log('REGEX_NOT_FOUND');
}