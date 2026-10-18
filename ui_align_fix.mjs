import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('/* SPACING_AND_NAV_FIX */')) {
  css += `

/* SPACING_AND_NAV_FIX */

/* 1. إبعاد زر موقعي عن شارة التقييم */
.locate-btn {
  margin-right: 16px !important;
}
.topbar .user-stats-badge {
  margin-right: 20px !important;
}

/* 2. تكبير أزرار شريط التنقل السفلي */
.bottom-nav button,
.bottom-nav a,
.bottom-nav .nav-item {
  padding: 10px 8px !important;
  min-width: 70px !important;
}
.bottom-nav button svg,
.bottom-nav a svg,
.bottom-nav .nav-item svg {
  width: 28px !important;
  height: 28px !important;
}
.bottom-nav button span,
.bottom-nav a span,
.bottom-nav .nav-item span {
  font-size: 14px !important;
  font-weight: 700 !important;
  margin-top: 4px !important;
}
.bottom-nav {
  padding: 10px 0 8px 0 !important;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('DONE');
} else {
  console.log('ALREADY_APPLIED');
}