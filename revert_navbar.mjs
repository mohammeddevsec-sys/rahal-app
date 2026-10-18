import fs from 'fs';

// 1. نسخة احتياطية على E (حماية)
const destE = 'E:/RAHAL_GOLDEN_BEFORE_NAVBAR_REVERT_' + Date.now();
fs.mkdirSync(destE, { recursive: true });
fs.cpSync('D:/RAHAL/src', destE + '/src', { recursive: true });
fs.cpSync('D:/RAHAL/server', destE + '/server', { recursive: true });
fs.cpSync('D:/RAHAL/public', destE + '/public', { recursive: true });
console.log('BACKUP_E_OK');

// 2. إزالة فرض اللون الأسود من الشريط العلوي والبطاقة السفلية
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

// إزالة البلوك الذي أضفناه مؤخراً (الذي أجبر الشريط على الأسود)
css = css.replace(/\.nav-waze-top\s*\{\s*background:\s*#000000\s*!important;\s*opacity:\s*1\s*!important;\s*\}/g, '');
css = css.replace(/\.nav-waze-sheet\s*\{\s*background:\s*#ffffff\s*!important;\s*opacity:\s*1\s*!important;\s*\}/g, '');

// إزالة أي فرض للألوان الداكنة على النص داخل الشريط (لتعود ألوانه الأصلية)
css = css.replace(/\/\* ===== DARK TEXT FOR NAV TOP \(transparent bg\) ===== \*\/[\s\S]*?(?=\/\*|$)/g, '');
// إزالة أي text-shadow !important قديم
css = css.replace(/text-shadow:[^;]+!important;/g, '');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS: NAVBAR REVERTED TO ORIGINAL');