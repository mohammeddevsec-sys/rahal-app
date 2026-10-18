import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
const c = fs.readFileSync(f, 'utf8');

// البحث عن الكلاسات التي تحتوي على bottom أو nav أو tab
const classes = c.match(/className="[^"]*(?:bottom|nav|tab)[^"]*"/g);
if (classes) {
  console.log('FOUND CLASSES:');
  const unique = [...new Set(classes)];
  unique.forEach(x => console.log(x));
}

// طباعة الجزء الأخير من الملف (شريط التنقل عادة في النهاية)
const idx = c.lastIndexOf('</main>');
if (idx !== -1) {
  console.log('--- LAST 1500 CHARS ---');
  console.log(c.substring(idx - 1500, idx + 100));
}