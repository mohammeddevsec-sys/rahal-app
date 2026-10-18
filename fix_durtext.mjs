import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// إزالة المتغير غير المستخدم durText لمنع خطأ الـ Lint
c = c.replace(/const durText = spokenDurationPhrase\([^)]*\)/g, '');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');