import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إضافة مسافة دقيقة بين زر "موقعي" وشارة "التقييم"
const spacingFix = `

/* ===== HEADER SPACING FIX ===== */
.topbar .locate-btn {
  margin-left: 16px !important; /* مسافة بين موقعي وشارة النقاط */
  margin-right: 16px !important; 
}
.topbar .user-stats-badge {
  margin-right: 4px !important;
}
`;

fs.writeFileSync(cssPath, css + spacingFix, 'utf8');
console.log('DONE');