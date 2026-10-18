import fs from 'fs';
const c = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');
const regex = /logo|svg|img/gi;
let match;
let found = false;
while ((match = regex.exec(c)) !== null) {
  const start = Math.max(0, match.index - 150);
  const end = Math.min(c.length, match.index + 150);
  const snippet = c.substring(start, end);
  // نطبع فقط إذا كان قريباً من كلمة "top-bar" أو "رحال"
  if (snippet.includes('top') || snippet.includes('header') || snippet.includes('brand') || snippet.includes('rah')) {
    console.log('--- FOUND AT INDEX ' + match.index + ' ---');
    console.log(snippet.trim());
    console.log('-------------------');
    found = true;
    break;
  }
}
if (!found) {
  // إذا لم نجد، نطبع أول 3000 حرف من الـ JSX للبحث يدوياً
  const jsxStart = c.indexOf('return (');
  if (jsxStart !== -1) {
    console.log('--- JSX START ---');
    console.log(c.substring(jsxStart, jsxStart + 1500));
    console.log('--- JSX END ---');
  }
}