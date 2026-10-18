import fs from 'fs';

// ===== 1. حقن CSS جبار في نهاية App.css =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إزالة أي تنسيقات سابقة لـ Waze لتجنب التداخل
css = css.replace(/\/\* ===== WAZE HARD MATCH ===== \*\/[\s\S]*$/g, '');

const forceCss = `

/* ===== WAZE HARD MATCH (FORCED) ===== */

/* 1. تكبير السهم ليكون واضحاً جداً (80px) */
.user-marker, .user-marker svg {
  width: 80px !important;
  height: 80px !important;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5)) !important;
}

/* 2. الشريط العلوي: أسود صريح */
.nav-waze-top {
  background: #000000 !important;
  color: #ffffff !important;
  border-radius: 0 0 20px 20px !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
  backdrop-filter: none !important;
}
.nav-waze-top * {
  color: #ffffff !important;
  text-shadow: none !important;
}
.nav-waze-distance {
  font-size: 36px !important;
  font-weight: 900 !important;
}
.nav-waze-street {
  font-size: 16px !important;
  color: #00d2d3 !important; /* لون سماوي لاسم الشارع */
}

/* 3. البطاقة السفلية: بيضاء صريحة */
.nav-waze-sheet {
  background: #ffffff !important;
  border-radius: 24px 24px 0 0 !important;
  border: none !important;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15) !important;
  backdrop-filter: none !important;
}
.nav-waze-sheet * {
  color: #0f172a !important;
  text-shadow: none !important;
}
.nav-waze-time {
  font-size: 36px !important;
  font-weight: 900 !important;
}

/* 4. زر الإبلاغ: أصفر فاقع وكبير */
.nav-waze-fab {
  background: #ffcc00 !important;
  color: #000000 !important;
  width: 70px !important;
  height: 70px !important;
  box-shadow: 0 6px 16px rgba(255, 204, 0, 0.5) !important;
}
`;

fs.writeFileSync(cssPath, css + forceCss, 'utf8');
console.log('CSS: FORCED WAZE STYLES APPLIED');

// ===== 2. تغيير لون المسار في App.jsx قسرياً =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// استبدال ألوان المسار (سواء كانت 12/8 أو 6/4 أو أي رقم)
app = app.replace(
  /paint:\s*\{\s*'line-color':\s*'#162e1a',\s*'line-width':\s*\d+,\s*'line-opacity':\s*\d+\s*\}/g,
  "paint: { 'line-color': '#e0cffc', 'line-width': 18, 'line-opacity': 1 }"
);
app = app.replace(
  /paint:\s*\{\s*'line-color':\s*'#2ecc71',\s*'line-width':\s*\d+,\s*'line-opacity':\s*\d+\s*\}/g,
  "paint: { 'line-color': '#7a12d6', 'line-width': 14, 'line-opacity': 1 }"
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('JSX: PURPLE ROUTE FORCED');