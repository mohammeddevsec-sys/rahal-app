import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// تكبير عرض المسار (من 6/4 إلى 12/8)
c = c.replace("'line-color': '#162e1a', 'line-width': 6", "'line-color': '#162e1a', 'line-width': 12");
c = c.replace("'line-color': '#2ecc71', 'line-width': 4", "'line-color': '#2ecc71', 'line-width': 8");

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');