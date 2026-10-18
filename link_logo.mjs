import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/\/logo-rah-al\.svg/g, '/logo-v2.svg');
c = c.replace(/\/logo-rah-square\.svg/g, '/logo-v2.svg');
fs.writeFileSync(f, c, 'utf8');
console.log('LOGO_LINKED');