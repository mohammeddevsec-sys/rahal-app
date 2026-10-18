import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

const fix = `
/* BRAND ALIGNMENT FIX */
.topbar .brand {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  gap: 6px !important;
}
.topbar .brand-mark {
  width: 52px !important;
  height: 52px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  margin: 0 auto !important;
}
.topbar .brand-mark img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}
`;
fs.writeFileSync(cssPath, css + fix, 'utf8');
console.log('FIXED');