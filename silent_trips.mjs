import fs from 'fs';

// 1. إزالة النطق عند بدء الرحلة في App.jsx
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/speakArabic\(UI_TEXT\.tripStarted[^)]*\)/g, '/* silent start */');
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: Start trip voice removed.');

// 2. إزالة النطق عند إلغاء الرحلة في voiceControl.js
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');
vc = vc.replace(/say\('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'\)/g, '/* silent cancel */');
fs.writeFileSync(vcPath, vc, 'utf8');
console.log('VOICE: Cancel trip voice removed.');