import fs from 'fs';
const appPath = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(appPath, 'utf8');

const lines = c.split('\n');
let lastMapLine = -100;
const result = [];
let removed = 0;

for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  if (trimmed === 'const map = mapRef.current;') {
    if (i - lastMapLine < 30) {
      console.log('REMOVED_DUPLICATE_AT_LINE=' + (i+1));
      removed++;
      continue;
    }
    lastMapLine = i;
  }
  result.push(lines[i]);
}

fs.writeFileSync(appPath, result.join('\n'), 'utf8');
console.log('TOTAL_REMOVED=' + removed);
console.log('DONE');