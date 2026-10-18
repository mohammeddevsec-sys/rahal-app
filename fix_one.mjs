import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');
const before = c;
c = c.split('Ø±Ø¬ÙˆØ¹ Ù„Ù„Ù…Ù„Ø§ØØ©').join("{'\\u0631\\u062C\\u0648\\u0639 \\u0644\\u0644\\u0645\\u0644\\u0627\\u062D\\u0629'}");
if (c === before) console.log('NO_MATCH');
else console.log('REPLACED');
fs.writeFileSync(f, c, 'utf8');