import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. تغيير النقاط من 10 إلى 3 في دالة الإضافة
c = c.replace(/addPoints\(10,\s*prev\)/g, 'addPoints(3, prev)');

// 2. تغيير النص المعروض في البطاقة المنبثقة إلى +3 نقاط
c = c.replace(/\+\s*10\s*نقاط/g, '+3 نقاط');

fs.writeFileSync(f, c, 'utf8');
console.log('POINTS_UPDATED_TO_3');