import fs from 'fs';

// 1. إصلاح startTrip في App.jsx (إزالة stopSpeaking)
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/stopSpeaking\(\)/g, '/* stopSpeaking removed from startTrip */');
fs.writeFileSync(appPath, app, 'utf8');
console.log('APP: stopSpeaking removed');

// 2. إصلاح voiceControl.js (تأخير استدعاء onStartTrip)
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// إزالة isMisheard إذا كان لا يزال موجوداً
vc = vc.replace(/const isMisheard = [^;]+;/g, '');
vc = vc.replace(/\|\|\s*isMisheard/g, '');

// جعل onStartTrip يُستدعى بعد تأخير بسيط (ليترك مجالاً لصوت "أهلا بك" أن ينتهي)
const startRegex = /if\s*\(typeof onStartTrip === 'function'\)\s*\{\s*onStartTrip\(\);\s*\}/;
if (startRegex.test(vc)) {
  vc = vc.replace(startRegex, "if (typeof onStartTrip === 'function') { setTimeout(() => { onStartTrip(); }, 1500); }");
  console.log('VOICE: onStartTrip delayed by 1500ms');
}

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');