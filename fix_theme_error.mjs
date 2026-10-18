import fs from 'fs';
const f = 'D:/RAHAL/src/lib/maplibreMap.js';
let c = fs.readFileSync(f, 'utf8');

// 1. إضافة theme كباراميتر لدالة buildStyle
c = c.replace(
  "function buildStyle(pmtilesUrl) {",
  "function buildStyle(pmtilesUrl, theme = 'light') {"
);

// 2. تمرير theme عند استدعاء buildStyle داخل initMap
c = c.replace(
  "style: buildStyle(pmtilesUrl),",
  "style: buildStyle(pmtilesUrl, theme),"
);

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');