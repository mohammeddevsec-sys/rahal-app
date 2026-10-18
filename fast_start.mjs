import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// تقليل وقت الانتظار بعد "أهلا بك" إلى 800 مللي ثانية (أقل من ثانية)
c = c.replace(/setTimeout\(\(\)\s*=>\s*\{\s*if\s*\(isListening\)\s*safeStart\(\)\s*\},\s*\d+\)/, 'setTimeout(() => { if (isListening) safeStart() }, 800)');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');