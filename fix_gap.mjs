import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إضافة مسافة قوية باستخدام Flex Gap لضمان عدم التلاصق
const spacingFix = `

/* ===== FIX TOUCHING BUTTONS ===== */
.topbar {
  gap: 20px !important; 
}
.top-actions {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important; /* مسافة بين زر موقعي وشارة النقاط */
}
.user-stats-badge {
  margin: 0 !important; /* إزالة أي هوامش قديمة ليعتمد على الـ gap */
}
`;

fs.writeFileSync(cssPath, css + spacingFix, 'utf8');
console.log('DONE');