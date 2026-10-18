import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
const lines = fs.readFileSync(f, 'utf8').split('\n');

console.log('LINE 605:', lines[604]);

// إصلاح السطر 605 (المؤشر يبدأ من 0)
if (lines[604]) {
  lines[604] = lines[604].replace(/\{\s*\}/, '{ /* noop */ }');
}

fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('FIXED');