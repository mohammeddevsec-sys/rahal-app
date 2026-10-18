import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// استبدل ",," (فاصلة زائدة) بـ ","
const before = c;
c = c.replace(/,\s*,\s*'/g, ", '");
c = c.replace(/,\s*\n\s*,\s*/g, ",\n    ");
c = c.replace(/,\s*,/g, ",");

if (c !== before) {
  console.log('COMMA: FIXED');
} else {
  console.log('COMMA: NO_DOUBLE_FOUND — trying direct line fix');
  // ابحث عن السطر 90 وسلط
  const lines = c.split('\n');
  if (lines[89] && lines[89].trim().startsWith(',')) {
    lines[89] = lines[89].replace(/^\s*,\s*/, '    ');
    console.log('LINE_90: FIXED');
  }
  c = lines.join('\n');
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');