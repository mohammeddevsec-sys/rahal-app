import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');
const currentLogo = /<div className="brand-mark">[\s\S]*?<\/div>/;
const newLogo = `<div className="brand-mark" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}><img src="/logo-rah-new.png" alt="رحال" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>`;
if (currentLogo.test(c)) {
  c = c.replace(currentLogo, newLogo);
  fs.writeFileSync(f, c, 'utf8');
  console.log('CODE_UPDATED');
} else {
  console.log('CODE_NOT_FOUND');
}