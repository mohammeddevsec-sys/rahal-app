import fs from 'fs';

const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// تصحيح لون الخط القوي (+10 نقاط) إلى الذهبي المضيء وإلغاء أي لون أسود مفروض
css = css.replace('color: #eab308;', 'color: #eab308 !important;');

// تصحيح لون الخط الصغير (شكراً لتنبيه الطريق) إلى الرمادي الفضي الفاتح والواضح
css = css.replace('color: #94a3b8;', 'color: #cbd5e1 !important;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('TEXT COLORS FIXED TO BLUE & GOLD');