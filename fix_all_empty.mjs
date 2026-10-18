import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// استبدال أي كتلة فارغة {} بكتلة تحتوي على تعليق
c = c.replace(/\{\s*\}/g, '{ /* noop */ }');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');