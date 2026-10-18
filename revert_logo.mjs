import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

const currentLogo = /<div className="brand-mark">\s*<img src="\/logo-v2\.svg"[^>]*\/>\s*<\/div>/;
const oldLogo = `<div className="brand-mark"><svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 6 L12 42 L20 42 L20 30 L28 42 L38 42 L28 27 C34 26 38 22 38 15 C38 9 34 6 27 6 Z" fill="#ffffff" /></svg></div>`;

if (currentLogo.test(c)) {
  c = c.replace(currentLogo, oldLogo);
  fs.writeFileSync(f, c, 'utf8');
  console.log('REVERTED_TO_SIMPLE_LOGO');
} else {
  console.log('PATTERN_NOT_FOUND');
}