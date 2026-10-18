import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

const forceSpacing = `

/* ===== FORCED SEPARATION ===== */
.topbar {
  gap: 16px !important;
  justify-content: space-between !important;
}
.user-stats-badge {
  margin-right: 16px !important;
  margin-left: 16px !important;
}
.locate-btn {
  margin-left: 16px !important;
  margin-right: 16px !important;
}
`;

fs.writeFileSync(cssPath, css + forceSpacing, 'utf8');
console.log('DONE');