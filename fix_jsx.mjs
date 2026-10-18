import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

let changes = 0;

// نستبدل فقط داخل زر الميكروفون (SVG الجديد) — نبحث عن نمط محدد
const targetStart = 'aria-label="الأوامر الصوتية"';
const idx = c.indexOf(targetStart);
if (idx === -1) {
  console.log('MIC_BTN: NOT_FOUND');
  process.exit(1);
}

// نأخذ نطاق 500 حرف بعد aria-label
const segment = c.substring(idx, idx + 800);
const fixed = segment
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=');

if (segment !== fixed) {
  c = c.substring(0, idx) + fixed + c.substring(idx + 800);
  changes++;
  console.log('MIC_BTN: FIXED');
} else {
  console.log('MIC_BTN: NO_CHANGES');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);