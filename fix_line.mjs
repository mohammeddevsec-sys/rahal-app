import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
const lines = fs.readFileSync(f, 'utf8').split('\n');
console.log('LINE_1445_BEFORE:', JSON.stringify(lines[1444]));
lines[1444] = "              <button type=\"button\" className=\"view-clear\" onClick={() => setActiveTab('home')}>{'\\u0631\\u062C\\u0648\\u0639 \\u0644\\u0644\\u0645\\u0644\\u0627\\u062D\\u0629'}</button>";
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('LINE_1445_AFTER:', JSON.stringify(lines[1444]));
console.log('DONE');