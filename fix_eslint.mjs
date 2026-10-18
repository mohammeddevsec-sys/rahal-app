import fs from 'fs';
const configFile = 'D:/RAHAL/eslint.config.js';
let content = fs.readFileSync(configFile, 'utf8');

// إضافة مجلدات dist و android إلى قائمة التجاهل (ignores)
if (content.includes("ignores: ['dist']")) {
  content = content.replace("ignores: ['dist']", "ignores: ['dist', 'android', '**/android/**']");
} else if (content.includes("ignores: []")) {
  content = content.replace("ignores: []", "ignores: ['dist', 'android', '**/android/**']");
} else if (content.includes("ignores:")) {
  // إذا كان موجوداً بصيغة أخرى
  content = content.replace(/ignores:\s*\[([^\]]*)\]/, "ignores: ['dist', 'android', '**/android/**', $1]");
} else {
  // إذا لم يكن موجوداً، نضيفه في بداية المصفوفة
  content = content.replace('export default [', "export default [\n  { ignores: ['dist', 'android', '**/android/**'] },");
}

fs.writeFileSync(configFile, content, 'utf8');
console.log('DONE');