import fs from 'fs';
const configFile = 'D:/RAHAL/eslint.config.js';
let content = fs.readFileSync(configFile, 'utf8');

// البحث عن مصفوفة التجاهل (ignores) بأي صيغة كانت
const ignoresRegex = /ignores:\s*\[([^\]]*)\]/;
if (ignoresRegex.test(content)) {
  // إذا وجدناها، نضيف android إليها
  content = content.replace(ignoresRegex, (match, inner) => {
    return `ignores: ['dist', 'android', '**/android/**', ${inner}]`;
  });
} else {
  // إذا لم نجدها، نضيفها في بداية أول كائن في المصفوفة
  content = content.replace(/\{/, "{\n    ignores: ['dist', 'android', '**/android/**'],");
}

fs.writeFileSync(configFile, content, 'utf8');
console.log('DONE');