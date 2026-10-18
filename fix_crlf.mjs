import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');
const oldLine = "onClick={() => setActiveTab('home')}>{'\\u0631\\u062C\\u0648\\u0639 \\u0644\\u0644\\u0645\\u0644\\u0627\\u062D\\u0629'}</button>";
const newLine = oldLine + "\r";
c = c.replace(oldLine + "\n", newLine + "\n");
fs.writeFileSync(f, c, 'utf8');
const lines = c.split('\n');
console.log('LINE_1445:', JSON.stringify(lines[1444]));