import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// ابحث عن "];" الذي يغلق ranaFilter
const idx = c.indexOf('ranaFilter = [');
if (idx === -1) { console.log('RANA_FILTER_NOT_FOUND'); process.exit(1); }

// ابحث عن "];" بعد ranaFilter
const endIdx = c.indexOf('];', idx);
if (endIdx === -1) { console.log('CLOSING_NOT_FOUND'); process.exit(1); }

// أدخل الكلمات الجديدة قبل "];"
const extras = `,
    '\\u0623\\u0647\\u0644\\u0627', '\\u0627\\u0647\\u0644\\u0627', '\\u0647\\u0644\\u0627', '\\u0628\\u0643', '\\u0645\\u0631\\u062D\\u0628\\u0627', '\\u0627\\u0647\\u0644\\u0627 \\u0628\\u0643'`;

c = c.substring(0, endIdx) + extras + c.substring(endIdx);
fs.writeFileSync(f, c, 'utf8');
console.log('FILTER: WELCOME WORDS ADDED');