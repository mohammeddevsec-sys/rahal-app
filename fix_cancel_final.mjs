import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

const startMarker = '// ===== STOP TRIP';
const endMarker = '// ===== START TRIP';
const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('MARKERS_NOT_FOUND');
  process.exit(1);
}

const newBlock = `// ===== STOP TRIP =====
  const cancelPatterns = [
    '\\u0627\\u0644\\u063A\\u0627\\u0621', '\\u0627\\u0644\\u063A\\u0627', '\\u0627\\u0644\\u063A\\u0647',
    '\\u0627\\u0644\\u063A\\u064A', '\\u0625\\u0644\\u063A\\u0627\\u0621', '\\u0625\\u0644\\u063A\\u064A',
    '\\u0648\\u0643\\u0641', '\\u0648\\u0642\\u0641', '\\u0627\\u0648\\u0642\\u0641', '\\u0623\\u0648\\u0642\\u0641',
    '\\u0627\\u0646\\u0647\\u064A', '\\u0623\\u0646\\u0647\\u064A', '\\u0627\\u0646\\u0647\\u0627\\u0621',
    '\\u062E\\u0644\\u0635', '\\u062E\\u0644\\u0627\\u0635'
  ];
  
  let hasCancelWord = false;
  for (const word of cancelPatterns) {
    if (text.includes(word)) { hasCancelWord = true; break; }
  }
  
  if (hasCancelWord) {
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629');
    }
    return;
  }

  `;

c = c.substring(0, startIdx) + newBlock + c.substring(endIdx);
fs.writeFileSync(f, c, 'utf8');
console.log('DONE');