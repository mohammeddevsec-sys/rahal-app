import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

const rules = [
  [/(nav-waze-mute[\s\S]*?aria-label=")[^"]*(")/, "$1{'\\u0643\\u062A\\u0645'}$2"],
  [/(nav-waze-exit[\s\S]*?aria-label=")[^"]*(")/, "$1{'\\u0625\\u064A\\u0642\\u0627\\u0641'}$2"],
  [/(nav-waze-speed-unit"[^>]*>)[^<]*(<\/div>)/, "$1{'\\u0643\\u0645/\\u0633'}$2"],
  [/(nav-waze-fab[\s\S]*?aria-label=")[^"]*(")/, "$1{'\\u0625\\u0628\\u0644\\u0627\\u063A'}$2"],
  [/(view-clear[\s\S]*?setActiveTab\('home'\)>)[^<]*(<\/button>)/, "$1{'\\u0631\\u062C\\u0648\\u0639 \\u0644\\u0644\\u0645\\u0644\\u0627\\u062D\\u0629'}$2"],
];

let count = 0;
for (const [re, rep] of rules) {
  const before = c;
  c = c.replace(re, rep);
  if (c !== before) count++;
  else console.log('NO_MATCH:', re.source.slice(0, 40));
}
fs.writeFileSync(f, c, 'utf8');
console.log('REPLACED:', count, 'of', rules.length);