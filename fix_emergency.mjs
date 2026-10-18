import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// استبدال كتلة الطوارئ بأنواع متعددة
const oldLine = "} else if (text.includes('\\u0639\\u0627\\u0637\\u0644') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A')) {";
const newLine = "} else if (text.includes('\\u0639\\u0627\\u0637\\u0644') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u0626') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A\\u0621') || text.includes('\\u0646\\u062C\\u062F\\u0629') || text.includes('\\u0627\\u0633\\u062A\\u063A\\u0627\\u062B\\u0629') || text.includes('\\u0637\\u0648\\u0627\\u0631')) {";

if (c.includes(oldLine)) {
  c = c.replace(oldLine, newLine);
  console.log('EMERGENCY: EXPANDED');
} else {
  console.log('EMERGENCY: NO_MATCH');
  console.log('Searching for partial...');
  const partial = "text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A')";
  if (c.includes(partial)) {
    c = c.replace(partial, "text.includes('\\u0637\\u0648\\u0627\\u0631\\u0626') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A') || text.includes('\\u0637\\u0648\\u0627\\u0631\\u064A\\u0621') || text.includes('\\u0646\\u062C\\u062F\\u0629') || text.includes('\\u0627\\u0633\\u062A\\u063A\\u0627\\u062B\\u0629') || text.includes('\\u0637\\u0648\\u0627\\u0631')");
    console.log('EMERGENCY: EXPANDED_PARTIAL');
  }
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');