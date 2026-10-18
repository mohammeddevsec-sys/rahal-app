import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// استبدال كتلة الشعار القديم بالكامل (بما فيها الـ SVG) بصورة الشعار الجديد
const regex = /<div className="brand-mark">[\s\S]*?<\/div>/;
const replacement = '<div className="brand-mark"><img src="/logo-v2.svg" alt="رحّال" style={{width: "42px", height: "42px", objectFit: "contain"}} /></div>';

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync(f, c, 'utf8');
  console.log('LOGO_REPLACED_SUCCESSFULLY');
} else {
  console.log('BRAND_MARK_NOT_FOUND');
}