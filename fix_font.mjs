import fs from 'fs';

// 1. تحديث ملف index.html لإضافة الخط الفاخر (Tajawal)
const htmlPath = 'D:/RAHAL/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<link[^>]*Cairo[^>]*>/g, ''); // إزالة خط Cairo القديم
if (!html.includes('Tajawal')) {
  html = html.replace('</head>', '  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">\n</head>');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('FONT_LINKED');
}

// 2. تحديث CSS لتطبيق الخط الجديد على الشريط العلوي
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/\/\* NEW_BRAND_FONT \*\/[\s\S]*$/m, ''); // حذف التنسيق القديم

const newCss = `
/* NEW_BRAND_FONT */
.topbar .brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.topbar .brand, .topbar .brand * {
  font-family: 'Tajawal', sans-serif !important;
}
/* اسم التطبيق (رحّال) */
.topbar .brand h1, 
.topbar .brand .title, 
.topbar .brand strong, 
.topbar .brand div:first-child {
  font-weight: 800 !important;
  font-size: 24px !important;
  color: #0f172a !important;
  letter-spacing: -0.5px !important;
  margin-bottom: 2px !important;
}
/* الوصف (ملاحة العراق) */
.topbar .brand span, 
.topbar .brand small, 
.topbar .brand div:last-child {
  font-weight: 700 !important;
  font-size: 13px !important;
  color: #0284c7 !important; /* لون أزرق سماوي راقي */
  letter-spacing: 0.5px !important;
}
`;
fs.writeFileSync(cssPath, css + newCss, 'utf8');
console.log('CSS_UPDATED');