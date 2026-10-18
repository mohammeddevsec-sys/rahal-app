import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// إصلاح أي كتلة catch فارغة
c = c.replace(/catch\s*\{\s*\}/g, 'catch { /* noop */ }');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');