import fs from 'fs';

// 1. استعادة النسخة الذهبية v14
const bk = 'D:/RAHAL/_backups/STABLE_v14_VOICE_FINAL_20261018_021149/src';
const dest = 'D:/RAHAL/src';

// نسخ الملفات الأساسية فقط
const files = ['App.jsx', 'App.css', 'lib/maplibreMap.js', 'lib/voiceControl.js'];
for (const f of files) {
  fs.copyFileSync(`${bk}/${f}`, `${dest}/${f}`);
}
console.log('RESTORED_V14');

// 2. تعديل بسيط جداً في App.jsx لتغيير لون المسار (بدون المساس بالكاميرا)
let app = fs.readFileSync(`${dest}/App.jsx`, 'utf8');
app = app.replace("'line-color': '#b899f0'", "'line-color': '#a885f5'"); // لون الحافة
app = app.replace("'line-color': '#6b1ec7'", "'line-color': '#7a12d6'"); // لون المسار
fs.writeFileSync(`${dest}/App.jsx`, app, 'utf8');
console.log('ROUTE_COLOR_UPDATED');

// 3. تكبير السهم في CSS (لحجم 50px)
let css = fs.readFileSync(`${dest}/App.css`, 'utf8');
css = css.replace(/\.user-marker\s*\{[^}]*width:\s*\d+px;[^}]*height:\s*\d+px;[^}]*\}/g, `.user-marker {
  width: 50px !important;
  height: 50px !important;
  cursor: pointer;
  z-index: 10;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
}`);
fs.writeFileSync(`${dest}/App.css`, css, 'utf8');
console.log('ARROW_RESIZED_TO_50PX');