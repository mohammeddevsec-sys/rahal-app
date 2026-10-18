import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إزالة أي إصلاحات سابقة لشريط التنقل لتجنب التداخل
css = css.replace(/\/\* SPACING_AND_NAV_FIX \*\/[\s\S]*/g, '');
css = css.replace(/\/\* ===== FINAL UI POLISH ===== \*\/[\s\S]*/g, '');

const newCss = `

/* ===== BOTTOM NAV SIZE BOOST ===== */
.bottom-nav {
  padding: 12px 0 16px 0 !important;
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
  background: #ffffff !important;
  border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.bottom-nav button {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  padding: 8px 16px !important;
  background: transparent !important;
  border: none !important;
  flex: 1 !important;
}

.bottom-nav button span {
  font-size: 28px !important; /* تكبير الأيقونة */
  line-height: 1 !important;
  color: #64748b !important; /* لون رمادي هادئ */
  transition: color 0.2s ease !important;
}

.bottom-nav button small {
  font-size: 14px !important; /* تكبير الخط */
  font-weight: 700 !important;
  color: #64748b !important;
  font-family: 'Tajawal', sans-serif !important;
}

/* الأزرار النشطة (التي يتم الضغط عليها) */
.bottom-nav button.active span,
.bottom-nav button.active small {
  color: #0b63ce !important; /* لون أزرق سماوي */
}
`;

fs.writeFileSync(cssPath, css + newCss, 'utf8');
console.log('DONE');