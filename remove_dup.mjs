import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);

let result = [];
let lastIndex = -99;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.trim() === 'const map = mapRef.current;' || line.trim() === 'const map = mapRef.current') {
        if (i - lastIndex < 20) { 
            console.log(`REMOVED LINE ${i+1}: ${line.trim()}`);
            continue; // تخطي هذا السطر (حذفه)
        }
        lastIndex = i;
    }
    result.push(line);
}

fs.writeFileSync(f, result.join('\n'), 'utf8');
console.log('DONE');