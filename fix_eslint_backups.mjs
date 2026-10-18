import fs from 'fs';
const configFile = 'D:/RAHAL/eslint.config.js';
let content = fs.readFileSync(configFile, 'utf8');

const oldIgnores = "{ ignores: ['dist', 'android', '**/android/**', 'node_modules', 'server/node_modules'] }";
const newIgnores = "{ ignores: ['dist', 'android', '**/android/**', 'node_modules', 'server/node_modules', '_backups', '**/_backups/**'] }";

if (content.includes(oldIgnores)) {
  content = content.replace(oldIgnores, newIgnores);
} else {
  content = content.replace(/\{ ignores: \[.*?\] \}/, newIgnores);
}
fs.writeFileSync(configFile, content, 'utf8');
console.log('DONE');