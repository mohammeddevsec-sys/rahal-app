import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// إزالة spokenDurationPhrase من الاستيراد لأنه لم يعد مستخدماً
c = c.replace(/, spokenDurationPhrase/g, '');
c = c.replace(/spokenDurationPhrase, /g, '');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');