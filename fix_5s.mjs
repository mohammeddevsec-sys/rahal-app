import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

if (c.includes('const MIC_WINDOW_MS = 12000')) {
  c = c.replace('const MIC_WINDOW_MS = 12000', 'const MIC_WINDOW_MS = 5000');
  fs.writeFileSync(f, c, 'utf8');
  console.log('MIC_WINDOW_MS: 12000 -> 5000 (5 seconds)');
} else {
  console.log('PATTERN_NOT_FOUND');
}