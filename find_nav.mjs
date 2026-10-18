import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
const c = fs.readFileSync(f, 'utf8');

// البحث عن شريط التنقل السفلي
const idx = c.indexOf('الرئيسية');
if (idx !== -1) {
  console.log('--- BOTTOM NAV HTML ---');
  console.log(c.substring(idx - 800, idx + 200));
  console.log('--- END ---');
}