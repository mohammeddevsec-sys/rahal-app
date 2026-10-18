import fs from 'fs';

// 1. نسخة احتياطية سريعة قبل التعديل
const destE = 'E:/RAHAL_GOLDEN_BEFORE_IVORY_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
console.log('BACKUP_E_OK');

// 2. تعديل App.css
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إزالة أي تنسيقات سابقة للشريط العلوي لتجنب التداخل
css = css.replace(/\/\* ===== LUXURIOUS IVORY TOP BAR ===== \*\/[\s\S]*$/g, '');

const ivoryCss = `

/* ===== LUXURIOUS IVORY TOP BAR ===== */
.nav-waze-top {
  background: rgba(250, 249, 246, 0.85) !important; /* لون عاجي شفاف */
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  border-radius: 0 0 24px 24px !important;
}

/* النصوص داخل الشريط العلوي */
.nav-waze-top * {
  color: #0f172a !important; /* لون داكن للتباين */
  text-shadow: none !important;
}

.nav-waze-distance {
  color: #0f172a !important;
  font-weight: 900 !important;
}

.nav-waze-street {
  color: #334155 !important;
  font-weight: 700 !important;
}

/* أزرار الكتم والإغلاق داخل الشريط */
.nav-waze-exit, .nav-waze-mute {
  background: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.nav-waze-exit svg path, .nav-waze-mute svg path {
  stroke: #0f172a !important;
  fill: #0f172a !important;
}
`;

fs.writeFileSync(cssPath, css + ivoryCss, 'utf8');
console.log('CSS_UPDATED_IVORY');