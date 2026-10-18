import fs from 'fs';
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إصلاح زر الكتم (إعادة stopSpeaking)
app = app.replace(/if\s*\(nv\)\s*\/\*\s*removed\s*\*\//, 'if (nv) stopSpeaking()');

// التأكد من عدم وجود أي أثر لـ /* removed */ في الملف (لتنظيف أي شيء آخر)
app = app.replace(/\/\*\s*removed\s*\*\//g, '/* noop */');

fs.writeFileSync(appPath, app, 'utf8');
console.log('DONE');